const catchAsync = require("../../../shared/catchasync");
const sendResponse = require("../../../shared/sendResponse");
const { orderService } = require("./order.service");

// changes -------------
const createOrder = catchAsync(async (req, res) => {
  const result = await orderService.createOrderIntoDB(req.user.userId, req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Order created successfully",
    data: result,
  });
});

// get all trips
const getOrderForTrip = catchAsync(async (req, res) => {
  const result = await orderService.getOrderForTrip();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "New order retrieved successfully",
    data: result,
  });
});

// get order details
const getSingleOrderDetails = catchAsync(async (req, res) => {
  const orderId = req.params.orderId;
  const result = await orderService.getSingleOrderDetails(orderId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Order details retrieved successfully",
    data: result,
  });
});

// cancel order
const cancelOrder = catchAsync(async (req, res) => {
  const result = await orderService.cancelOrderUser(req);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Order cancel successfully.",
    data: result,
  });
});

// accept order
const acceptOrder = catchAsync(async (req, res) => {
  const result = await orderService.acceptDriverOrder(req);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Order accepted successfully.",
    data: result,
  });
});
 
// update the trip status----------------------------------
const updateDriverByOrderStatus = catchAsync(async (req, res) => {
  const orderId = req.params.orderId;
  const status = req.body.status;
  const result = await orderService.updateDriverByOrderStatus(orderId, status);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Update status successfully",
    data: result,
  });
});

// driver order history ---------------------
const driverOrderHistory = catchAsync(async (req, res) => {;
  const result = await orderService.driverOrderHistory(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Driver history get successfully",
    data: result,
  });
});

// driver order history ---------------------
const userOrderHistory = catchAsync(async (req, res) => {;
  const result = await orderService.userOrderHistory(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User history get successfully",
    data: result,
  });
});

 

const confirmTripByUser = catchAsync(async (req, res) => {
  const orderId = req?.params?.orderId;
  const doctorId = req?.body?.doctorId;
  const result = await orderService.confirmTripByUser(orderId, doctorId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "trip confirmed successfully",
    data: result,
  });
});

 

const orderController = {
  createOrder,
  getOrderForTrip, 
  getSingleOrderDetails,
  updateDriverByOrderStatus,
  confirmTripByUser,
  acceptOrder,
  cancelOrder,
  driverOrderHistory,
  userOrderHistory
};

module.exports = { orderController };