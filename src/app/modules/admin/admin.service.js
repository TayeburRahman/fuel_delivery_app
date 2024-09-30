const ApiError = require("../../../errors/ApiError");  
const httpStatus = require("http-status"); 
const Auth = require("../auth/auth.model");
const Admin = require("./admin.model");
const User = require("../user/user.model");
const Driver = require("../driver/driver.model");
const QueryBuilder = require("../../../builder/QueryBuilder"); 
const { sendAdminMail } = require("../../../utils/sendAdminMail");


// Update profile
const updateProfile = async (req) => {
  const { files } = req;
  const { userId, authId} = req.user;

  const data = req.body;
  if (!data) {
    throw new ApiError(400, "Data is missing in the request body!");
  }

  const checkUser = await Admin.findById(userId);
  if (!checkUser) {
    throw new ApiError(404, "User not found!");
  }

  const checkAuth = await Auth.findById(authId);
  if (!checkAuth) {
    throw new ApiError(403, "You are not authorized");
  }

  let profile_image;
  if (files?.profile_image) {
    profile_image = `/images/image/${files.profile_image[0].filename}`;
  }

  let cover_image;
  if (files?.cover_image) {
    cover_image = `/images/image/${files.cover_image[0].filename}`;
  }

  const updatedData = {
    ...data,
    ...(profile_image && { profile_image }),
    ...(cover_image && { cover_image }),
  };

   await Auth.findOneAndUpdate(
    { _id: authId },
    { name: updatedData.name },
    { new: true }
  );

  const updateUser = await Admin.findOneAndUpdate(
    { authId },
    updatedData,
    { new: true }
  ).populate('authId');

  return updateUser;
}; 
// Get single user
const myProfile = async (req) => {
  const {userId} = req.user;
  const result = await Admin.findById(userId).populate('authId');
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }

  return result;
}; 
 
// Get all request driver
const getAllRequestDrivers = async (query) => {
  const userQuery = new QueryBuilder(Driver.find().populate('authId'), query)
  .search(["name","email","user_name"])
  .filter()
  .sort()
  .paginate()
  .fields()

  const result = await userQuery.modelQuery;
  const meta = await userQuery.countTotal();

  console.log(result);

  // Filter users to get only those with isActive === true
  const activeUsers = result.filter(user => user.authId && !user.authId.isActive);

  if (activeUsers.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "Driver no't found");
  }
  return {
    meta,
    data: activeUsers,
  };

}
 
// -- get user profile -----
const getDriverDetails = async (req) => {
  const { email } = req.params;
  const driver = await Driver.findOne({ email: email }).populate('authId');
  if (!driver) {
    throw new ApiError(httpStatus.NOT_FOUND, "Driver not found");
  }
  return driver;
};

// -- block user -----
const blockUnblockUserDriver = async (payload) => {
  const { email, is_block } = payload;
  const existingUser = await User.findOne({ email: email });

  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  return await User.findOneAndUpdate(
    { email: email },
    { $set: { is_block } },
    {
      new: true,
      runValidators: true,
    }
  );
}; 

// approve Admin - done
const approveAdmins = async (email) => { 

  if(!email){  
      throw new ApiError(400, "Email is required!"); 
  }
  const existUser = await Auth.findOne({ email }); 
  if (!existUser) {
    throw new ApiError(400, "Admin not found");
  }

  const active = await Auth.findOneAndUpdate(
    { email },
    { isActive: true },
    {
      new: true,
      runValidators: true,
    }
  );

  return active;
};

// approve Admin 
const approveDriver = async (email) => { 

  if(!email){  
      throw new ApiError(400, "Email is required!"); 
  } 
  const existUser = await Driver.findOne({ email }); 
  const existAuth = await Auth.findOne({ email });  
 
  if (!existUser || !existAuth) {
    throw new ApiError(400, "User not found");
  } 
  
  const active = await Auth.findOneAndUpdate(
    { email },
    { isActive: true },
    {
      new: true,
      runValidators: true,
    }
  ); 

  sendAdminMail(
    email,
    "Your application for driver profile approved.",
    `<!DOCTYPE html>
     <html lang="en">
     <head>
         <meta charset="UTF-8">
         <meta name="viewport" content="width=device-width, initial-scale=1.0">
         <title>Driver Profile Approval</title>
         <style>
             body {
                 font-family: Arial, sans-serif;
                 background-color: #f4f4f4;
                 margin: 0;
                 padding: 20px;
             }
             .container {
                 max-width: 600px;
                 margin: auto;
                 background: white;
                 padding: 20px;
                 border-radius: 5px;
                 box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
             }
             h1 {
                 color: #333;
             }
             p {
                 color: #555;
                 line-height: 1.5;
             }
             .footer {
                 margin-top: 20px;
                 font-size: 12px;
                 color: #999;
             }
         </style>
     </head>
     <body>
         <div class="container">
             <h1>Hello, ${existUser.name}</h1>
             <p>We are pleased to inform you that your application for the driver profile has been approved.</p>
             <p>Thank you for your patience and for being a part of our community!</p>
             <div class="footer">
                 <p>&copy; ${new Date().getFullYear()} bdCalling. All rights reserved.</p>
             </div>
         </div>
     </body>
     </html>`
  );

  return active;
};

// approve Admin 
const declineDriver = async (req) => { 
  const email = req.params.email;
  const { text } = req.body;
 
  if (!email) {  
    throw new ApiError(400, "Email is required!"); 
  } 
  if (!text) {  
    throw new ApiError(400, "Decline reason not provided!"); 
  }  
 
  const existAuth = await Auth.findOne({ email });
  if (!existAuth) {
    throw new ApiError(400, "Driver not found");
  } 

  await Promise.all([  
    Driver.deleteOne({ authId: existAuth._id }), 
    Auth.deleteOne({ email })
  ]);
 
  const emailBody = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Driver Profile Decline</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 20px;
            }
            .container {
                max-width: 600px;
                margin: auto;
                background: white;
                padding: 20px;
                border-radius: 5px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            h1 {
                color: #333;
            }
            p {
                color: #555;
                line-height: 1.5;
            }
            .footer {
                margin-top: 20px;
                font-size: 12px;
                color: #999;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Hello, ${existUser.name}</h1>
            <p>We are sorry to inform you that your application for the driver profile has been declined.</p>
            <p><strong>The reason is:</strong> <strong>${text}</strong></p>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} bdCalling. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
  await sendAdminMail(email, "Your application for driver profile declined.", emailBody);

  return { message: "Driver application declined and notified." };
};

// Delete my account
const deleteMyAccount = async (payload) => {
  const { email, password } = payload;

  const isUserExist = await Auth.isAuthExist(email);
  if (!isUserExist) {
    throw new ApiError(404, "User does not exist");
  }

  if (
    isUserExist.password &&
    !(await Auth.isPasswordMatched(password, isUserExist.password))
  ) {
    throw new ApiError(402, "Password is incorrect");
  }
         await Admin.deleteOne({authId: isUserExist._id}) 
  return await Auth.deleteOne({ email });
};

// Delete admin account
const deleteAdmin = async (email) => { 
  const isUserExist = await Auth.isAuthExist(email);
  if (!isUserExist) {
    throw new ApiError(404, "Admin does not exist");
  }

         await Admin.deleteOne({authId: isUserExist._id}) 
  return await Auth.deleteOne({ email });
};

// Delete admin account
const deleteUser = async (email) => { 
  const isUserExist = await Auth.isAuthExist(email);
  if (!isUserExist) {
    throw new ApiError(404, "User does not exist");
  }
         await User.deleteOne({authId: isUserExist._id}) 
  return await Auth.deleteOne({ email });
};

// Delete admin account
const deleteDriver = async (email) => { 
  const isUserExist = await Auth.isAuthExist(email);
  if (!isUserExist) {
    throw new ApiError(404, "Driver does not exist");
  }
         await Driver.deleteOne({authId: isUserExist._id}) 
  return await Auth.deleteOne({ email });
};
  
// Get all user
const getAllUsers = async (query) => {
  const userQuery = new QueryBuilder(User.find().populate('authId'), query)
  .search(["name","email","user_name"])
  .filter()
  .sort()
  .paginate()
  .fields()

  const result = await userQuery.modelQuery;
  const meta = await userQuery.countTotal();

  console.log(result);

  // Filter users to get only those with isActive === true
  const activeUsers = result.filter(user => user.authId && user.authId.isActive);

  if (activeUsers.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "User no't found");
  }

  return {
    meta,
    data: activeUsers,
  };

} 

// Get all user
const getAllDriver = async (query) => {
  const userQuery = new QueryBuilder(Driver.find().populate('authId'), query)
  .search(["name","email","user_name"])
  .filter()
  .sort()
  .paginate()
  .fields()

  const result = await userQuery.modelQuery;
  const meta = await userQuery.countTotal();

  console.log(result);

  // Filter users to get only those with isActive === true
  const activeUsers = result.filter(user => user.authId && user.authId.isActive);

  if (activeUsers.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "Driver no't found");
  }
  return {
    meta,
    data: activeUsers,
  };

}

// Get all admin
const getAllAdmin = async () => {
  const result = await Admin.find({}).populate('authId');
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  } 
  return result;
}; 

// Get all driver
// const getAllDriver = async (user) => {
//   const result = await Admin.findOne({authId: user.userId}).populate('authId');
//   if (!result) {
//     throw new ApiError(httpStatus.NOT_FOUND, "User not found");
//   } 
//   return result;
// }; 

const AdminService = {
  updateProfile,
  myProfile,
  deleteAdmin,
  deleteUser,
  approveAdmins,
  deleteMyAccount,
  getAllUsers,
  getAllAdmin, 
  approveDriver,
  getAllDriver,
  deleteDriver,
  getAllRequestDrivers, 
  getDriverDetails,
  blockUnblockUserDriver,
  approveDriver,
  declineDriver,

};

module.exports = { AdminService };
