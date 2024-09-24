const catchAsync = require("../../../shared/catchasync");
const sendResponse = require("../../../shared/sendResponse");
const DashboardServices = require("./dashboard.service");

// --- user ---

const getAllUsers = catchAsync(async (req, res) => {
  const { result, meta } = await DashboardServices.getAllUsers(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User retrieved successfully",
    meta: meta,
    data: result,
  });
});

const getSingleUser = catchAsync(async (req, res) => {
  const result = await DashboardServices.getSingleUser(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User retrieved successfully",
    data: result,
  });
});

const blockUnblockUser = catchAsync(async (req, res) => {
  const result = await DashboardServices.blockUnblockUser(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User retrieved successfully",
    data: result,
  });
});
 

const DashboardController = {
  getAllUsers,
  getSingleUser,
  blockUnblockUser, 
};

module.exports = DashboardController;
