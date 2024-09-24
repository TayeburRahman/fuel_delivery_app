 
const ApiError = require("../../../errors/ApiError");
const cron = require("node-cron");
const User = require("./user.model");
const jwt = require("jsonwebtoken");
const config = require("../../../config");
const { jwtHelpers } = require("../../../helpers/jwtHelpers");
const httpStatus = require("http-status"); 
 
const Auth = require("../auth/auth.model");


// Update profile
const updateProfile = async (req) => {
  const { files } = req;
  const { userId } = req.user;

  const data = req.body;
  if (!data) {
    throw new Error("Data is missing in the request body!");
  }

  const checkUser = await User.findById(userId); 
  if (!checkUser) {
    throw new ApiError(404, "User not found!");
  }

  const checkAuth= await Auth.findById(checkUser?.authId); 
  if (!checkAuth) {
    throw new ApiError(404, "You are not authorized");
  } 
  
  let profile_image = undefined;
  if (files && files.profile_image) {
    profile_image = `/images/image/${files.profile_image[0].filename}`;
  }  

  const updatedUserData = { ...data };

  const updateUser = await User.findOneAndUpdate(
    { _id: userId },
    { profile_image, ...updatedUserData },
    {
      new: true,
    }
  ); 
  return updateUser;
};
  
// Get all users
const getAllUsers = async (query) => {
  const userQuery = await User.find();
  // const userQuery = new User.find()
  //     .search()
  //     .filter()
  //     .sort()
  //     .paginate()
  //     .fields();

  // const result = await userQuery.modelQuery;
  // const meta = await userQuery.countTotal();

  return {
    // meta,
    data: userQuery,
  };
};

// Get single user
const getSingleUser = async (user) => {
  const result = await User.findById(user.userId);
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  return result;
}; 
   
// Delete my account
const deleteMyAccount = async (payload) => {
  const { email, password } = payload;

  const isUserExist = await User.isUserExist(email);
  if (!isUserExist) {
    throw new ApiError(404, "User does not exist");
  }

  if (
    isUserExist.password &&
    !(await User.isPasswordMatched(password, isUserExist.password))
  ) {
    throw new ApiError(402, "Password is incorrect");
  }
  return await User.findOneAndDelete({ email });
};
 
const UserService = {
  getAllUsers,
  getSingleUser, 
  deleteMyAccount, 
  updateProfile
};

module.exports = { UserService };
