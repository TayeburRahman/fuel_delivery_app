const { DriverService } = require("./driver.service");
const sendResponse = require("../../../shared/sendResponse");
const catchAsync = require("../../../shared/catchasync"); 


const updateProfile = catchAsync(async (req, res) => {
  const result = await DriverService.updateProfile(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

const getProfile = catchAsync(async (req, res) => { 
  const result = await DriverService.getProfile(req.user);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User retrieved successfully",
    data: result,
  });
}); 

const deleteMyAccount = catchAsync(async (req, res) => {
  await DriverService.deleteMyAccount(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Account deleted!",
  });
}); 

const UserController = { 
  deleteMyAccount,  
  getProfile, 
  updateProfile
};

module.exports = { UserController };
