 
const ApiError = require("../../../errors/ApiError"); 
const httpStatus = require("http-status"); 
const Auth = require("../auth/auth.model");
const Driver = require("./driver.model");

 
const updateProfile = async (req) => {
  const { files } = req;  
  const { authId, userId } = req.user;  

  // Validate user existence
  const checkValidDriver = await Driver.findById(userId);
  if (!checkValidDriver) {
    throw new ApiError(404, 'You are not authorized');
  } 
  const data = req.body;

  // Handle file uploads if they exist
  const fileUploads = {};
  if (files) {
    if (files.licenseFrontImage && files.licenseFrontImage[0]) {
      fileUploads.licenseFrontImage = `/images/licenses/${files.licenseFrontImage[0].filename}`;
    }
    if (files.licenseBackImage && files.licenseBackImage[0]) {
      fileUploads.licenseBackImage = `/images/licenses/${files.licenseBackImage[0].filename}`;
    }
    if (files.vehicleDocumentImage && files.vehicleDocumentImage[0]) {
      fileUploads.vehicleDocumentImage = `/images/vehicle/${files.vehicleDocumentImage[0].filename}`;
    }
    if (files.vehicleImage && files.vehicleImage[0]) {
      fileUploads.vehicleImage = `/images/vehicle/${files.vehicleImage[0].filename}`;
    }
    if (files.profile_image && files.profile_image[0]) {
      fileUploads.profile_image = `/images/profile/${files.profile_image[0].filename}`;
    }
  }

  // Merge data and file uploads
  const updatedUserData = { ...data, ...fileUploads };
  console.log('DriverData', updatedUserData);

     await Auth.findOneAndUpdate(
    { _id: authId },
    {name: updatedUserData.name },
    {
      new: true,
    }
    ); 

  // Update driver profile
  const result = await Driver.findOneAndUpdate(
    { _id: userId },
    updatedUserData,
    {
      new: true,
      runValidators: true,
    },
  );

  return result;
};

    
// Get single user
const getProfile = async (user) => {
  const userId= user.userId;  
  const result = await Driver.findById(userId).populate('authId');
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  } 
  return result;
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
         await Driver.deleteOne({authId: isUserExist._id}) 
  return await Auth.deleteOne({ email });
};
 
const DriverService = { 
  getProfile, 
  deleteMyAccount, 
  updateProfile
};

module.exports = { DriverService };
