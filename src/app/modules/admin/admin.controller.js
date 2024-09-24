const sendResponse = require("../../../shared/sendResponse");
const { AdminService } = require("./admin.service");
const catchAsync = require("../../../shared/catchasync");
const config = require("../../../config");

const registrationUser = catchAsync(async (req, res) => {
  const result = await AdminService.registrationUser(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin Created",
    data: result,
  });
});

const createUser = catchAsync(async (req, res) => {
  const userData = req.body;

  const result = await AdminService.createUser(userData);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User created successfully",
    data: result,
  });
});

const getAllUsers = catchAsync(async (req, res) => {
  const result = await AdminService.getAllUsers(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getSingleUser = catchAsync(async (req, res) => {
  const id = req.params.id;
  const result = await AdminService.getSingleUser(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User retrieved successfully",
    data: result,
  });
});

const updateAdmin = catchAsync(async (req, res) => {
  const id = req.params.id;
  const result = await AdminService.updateAdmin(id, req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin updated successfully",
    data: result,
  });
});

const deleteUser = catchAsync(async (req, res) => {
  const id = req.params.id;
  const result = await AdminService.deleteUser(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User deleted successfully",
    data: result,
  });
});

const login = catchAsync(async (req, res) => {
  const loginData = req.body;
  const result = await AdminService.login(loginData);
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
    message: "Admin logged in successfully!",
    data: result,
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  const result = await AdminService.refreshToken(refreshToken);

  // set refresh token into cookie
  const cookieOptions = {
    secure: config.env === "production",
    httpOnly: true,
  };
  res.cookie("refreshToken", refreshToken, cookieOptions);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin logged in successfully!",
    data: result,
  });
});

const changePassword = catchAsync(async (req, res) => {
  const passwordData = req.body;

  await AdminService.changePassword(req.user, passwordData);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Password changed successfully!",
  });
});

const getAllAdmin = catchAsync(async (req, res) => {
  const result = await AdminService.getAllAdmin();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Successful!",
    data: result,
  });
});

const myProfile = catchAsync(async (req, res) => {
  const result = await AdminService.myProfile(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Successful!",
    data: result,
  });
});

const forgotPass = catchAsync(async (req, res) => {
  await AdminService.forgotPass(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Check your email!",
  });
});

const resetPassword = catchAsync(async (req, res) => {
  await AdminService.resetPassword(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Account recovered!",
  });
});

const deleteAdmin = catchAsync(async (req, res) => {
  const id = req.params.id;
  const result = await AdminService.deleteAdmin(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin deleted successfully",
    data: result,
  });
});

const checkIsValidForgetActivationCode = catchAsync(async (req, res) => {
  const result = await AdminService.checkIsValidForgetActivationCode(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Success!",
    data: result,
  });
});

const AdminController = {
  createUser,
  getAllUsers,
  getSingleUser,
  deleteUser,
  registrationUser,
  login,
  changePassword,
  refreshToken,
  updateAdmin,
  getAllAdmin,
  myProfile,
  forgotPass,
  resetPassword,
  deleteAdmin,
  checkIsValidForgetActivationCode,
};

module.exports = { AdminController };
