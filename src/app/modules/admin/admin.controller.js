const sendResponse = require("../../../shared/sendResponse");
const { AdminService } = require("./admin.service");
const catchAsync = require("../../../shared/catchasync");
const config = require("../../../config");

 

const updateProfile = catchAsync(async (req, res) => {
  const result = await AdminService.updateProfile(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profile updated successfully",
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

const getAllUsers = catchAsync(async (req, res) => {
  const result = await AdminService.getAllUsers(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User retrieved successfully",
    data: result,
    meta: result.meta,
  });
}); 
 
const getAllAdmins = catchAsync(async (req, res) => {
  const result = await AdminService.getAllAdmin();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Successful!",
    data: result,
  });
});

const getAllDriver = catchAsync(async (req, res) => {
  const result = await AdminService.getAllDriver();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Successful!",
    data: result,
  });
});

const getAllRequestDrivers = catchAsync(async (req, res) => {
  const result = await AdminService.getAllRequestDrivers();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Successful!",
    data: result,
  });
});

const getAllRequestAdmin= catchAsync(async (req, res) => {
  const result = await AdminService.getAllRequestAdmin();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Successful!",
    data: result,
  });
});

 
const getDriverDetails = catchAsync(async (req, res) => {
  const result = await AdminService.getDriverDetails(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User retrieved successfully",
    data: result,
  });
});

const blockUnblockUserDriver = catchAsync(async (req, res) => {
  const result = await AdminService.blockUnblockUserDriver(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User retrieved successfully",
    data: result,
  });
});
 
const approveAdmins = catchAsync(async (req, res) => {
  const email = req.params.email;
  const result = await AdminService.approveAdmins(email);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin approve successfully",
    data: result,
  });
}); 

const approveDriver = catchAsync(async (req, res) => {
  const email = req.params.email;
  const result = await AdminService.approveDriver(email);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Driver approve successfully",
    data: result,
  });
}); 

const declineDriver = catchAsync(async (req, res) => {
  const result = await AdminService.declineDriver(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Driver decline successfully",
    data: result,
  });
}); 
   
const deleteAdmin = catchAsync(async (req, res) => {
  const email = req.params.email;
  const result = await AdminService.deleteAdmin(email);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin deleted successfully",
    data: result,
  });
}); 

const deleteUser = catchAsync(async (req, res) => {
  const email = req.params.email;
  const result = await AdminService.deleteUser(email);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User deleted successfully",
    data: result,
  });
});


const deleteDriver = catchAsync(async (req, res) => {
  const email = req.params.email;
  const result = await AdminService.deleteDriver(email);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Driver deleted successfully",
    data: result,
  });
});
 

const AdminController = {
  updateProfile,
  getAllUsers, 
  deleteUser, 
  getAllAdmins,
  myProfile, 
  deleteAdmin, 
  approveAdmins,
  approveDriver,
  getAllDriver,
  deleteDriver,
  getAllRequestDrivers,
  getAllRequestAdmin,
  getDriverDetails,
  blockUnblockUserDriver,
  declineDriver
};

module.exports = { AdminController };
