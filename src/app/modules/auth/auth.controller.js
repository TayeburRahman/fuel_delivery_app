const { AuthService } = require("./auth.service");
const sendResponse = require("../../../shared/sendResponse");
const catchAsync = require("../../../shared/catchasync");
const config = require("../../../config");

const registrationAccount = catchAsync(async (req, res) => {
 const {role} =  await AuthService.registrationAccount(req);
 const message = role === "USER" ? "Please check your email for the activation OTP code.":"Your account is awaiting admin approval." ;

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message,
    data: role,
  });
});

const registrationDriverAccount = catchAsync(async (req, res) => {
  const {role, result} =  await AuthService.registrationDriverAccount(req);
  const message = "Your account is awaiting admin approval." ; 
   sendResponse(res, {
     statusCode: 200,
     success: true,
     message,
     data: result,
   });
 });



const activateAccount = catchAsync(async (req, res) => {
  const result = await AuthService.activateAccount(req.body);
  const { refreshToken } = result;
  // set refresh token into cookie
  const cookieOptions = {
    secure: config.env === "production",
    httpOnly: true,
  };
  res.cookie("refreshToken", refreshToken, cookieOptions);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Activation code verified successfully.",
    data: result,
  });
});

const deleteAccount = catchAsync(async (req, res) => {
  const id = req.params.id;
  const result = await AuthService.deleteAccount(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Auth deleted successfully",
    data: result,
  });
});

const loginAccount = catchAsync(async (req, res) => {
  const loginData = req.body;
  const result = await AuthService.loginAccount(loginData);
  const { refreshToken } = result;
  // set refresh token into cookie
  const cookieOptions = {
    secure: config.env === "production",
    httpOnly: true,
  };
  res.cookie("refreshToken", refreshToken, cookieOptions);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Auth logged in successfully!",
    data: result,
  });
});

const changePassword = catchAsync(async (req, res) => {
  const passwordData = req.body;
  const user = req.user;
  await AuthService.changePassword(user, passwordData);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Password changed successfully!",
  });
});
 
const forgotPass = catchAsync(async (req, res) => {
  await AuthService.forgotPass(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Check your email!",
  });
});

const checkIsValidForgetActivationCode = catchAsync(async (req, res) => {
  const result = await AuthService.checkIsValidForgetActivationCode(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Code verified successfully",
    data: result,
  });
});

const resendCodeActivationAccount = catchAsync(async (req, res) => {
  const data = req.body;
  const result = await AuthService.resendCodeActivationAccount(data);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Resent successfully",
    data: result,
  });
});

const resendCodeForgotAccount = catchAsync(async (req, res) => {
  const data = req.body;
  const result = await AuthService.resendCodeForgotAccount(data);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Resent successfully",
    data: result,
  });
});

 

const resendActivationCode = catchAsync(async (req, res) => {
  const data = req.body;
  const result = await AuthService.resendActivationCode(data);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Resent successfully",
    data: result,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  await AuthService.resetPassword(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Password has been reset successfully.",
  });
});

const blockAccount = catchAsync(async (req, res) => {
  const id = req.params.id;
  const result = await AuthService.blockAccount(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Auth blocked successfully",
    data: result,
  });
});

const AuthController = {
  registrationAccount,
  registrationDriverAccount,
  activateAccount,
  loginAccount, 
  changePassword,
  forgotPass,
  resetPassword,
  resendActivationCode,
  checkIsValidForgetActivationCode, 
  blockAccount, 
  deleteAccount,
  resendCodeActivationAccount,
  resendCodeForgotAccount
};

module.exports = { AuthController };
