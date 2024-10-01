const httpStatus = require("http-status");
const ApiError = require("../../../errors/ApiError");
const Order = require("./order.modal");
const { ENUM_JOB_STATUS } = require("../../../utils/enums");
const Transaction = require("./transaction.modal");
const { sendNotification, emitNotification } = require("../notification/notification.service");
const { format, startOfMonth, endOfMonth } = require('date-fns');

const createOrderIntoDB = async (userId, payload) => {
  payload.user = userId;

  if (!payload.stripId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Payment ID is required to create your order.");
  } else {
    payload.payment = "paid";
  }
  const result = await Order.create(payload);

  const skippedTId = payload.stripId.slice(-10);
  if (!result) {
    await sendNotification(
      'Order Creation Failed',
      `Unable to create your order. Please contact support with stripe transaction ID: #${skippedTId}.`,
      userId
    );
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to create the order. Please contact our support.");
  }
  const order = {
    orderId: result._id,
    deliveryFee: payload.deliveryFee,
    user: userId,
    transactionId: payload.stripId,
    date: new Date(),
    type: "pay-order",
    totalAmount: payload.amount,
    payment: "stripe",
    status: "success"
  };

  const transaction = await Transaction.create(order);

  if (!transaction) {
    await sendNotification(
      'Failed to create transaction.',
      `Your order was created, but the transaction failed. Please contact support with stripe transaction ID: #${skippedTId}.`,
      userId, //userId
      null, //driverId
      result._id //orderId
    );
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to create the transaction. Please contact our support.");
  }

  const userNotification = await sendNotification(
    'New Order Created',
    `You have successfully created a new order.`,
    userId, //userId
    null, //driverId
    result._id //orderId
  );

  const paymentNotification = await sendNotification(
    'Order Payment Successful',
    `Your payment of $${payload.amount} has been successfully processed. Stripe transaction ID: #${skippedTId}.`,
    userId, //userId
    null, //driverId
    result._id //orderId

  );

  await emitNotification(userId, userNotification);
  await emitNotification(userId, paymentNotification);

  return { order: result, transaction };
};

// get all trips
const getOrderForTrip = async () => {
  const result = await Order.find({ status: "pending", payment: "paid" });
  return result;
};

// get order details
const getSingleOrderDetails = async (orderId) => {

  if (!orderId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Order ID is required!");
  }
  const result = await Order.findById(orderId);
  return result;
};

// ----accept order-----------
const cancelOrderUser = async (req) => {
  const orderId = req.params.orderId;
  const { userId } = req.user;

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, "Order not found!");
  }

  if (order.status === "canceled") {
    throw new ApiError(httpStatus.CONFLICT, "This order has already been canceled.");
  }

  if (order.status !== "pending") {
    throw new ApiError(httpStatus.CONFLICT, "This order has been accepted by a driver; you can't cancel it now.");
  }

  const result = await Order.findByIdAndUpdate(
    orderId,
    { status: "canceled" },
    { new: true }
  );

  if (!result) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to cancel the order.");
  }

  const userNotification = await sendNotification(
    'Cancel your order.',
    `Dear User, you have successfully canceled your own order.`,
    userId, //userId
    null, //driverId
    orderId, //orderId

  );

  await emitNotification(userId, userNotification);

  return {
    message: "This order has been canceled successfully!",
    orderId: result._id,
  };
};

// ----accept order-----------
const acceptDriverOrder = async (req) => {
  const orderId = req.params.orderId;
  const { userId } = req.user;

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, "Order not found!");
  }
  if (order.status === "accepted") {
    throw new ApiError(httpStatus.CONFLICT, "This order has already been accepted by a driver.");
  }

  const result = await Order.updateOne(
    { _id: orderId },
    {
      status: "accepted",
      $set: { confirmedDriver: userId },
    }
  );

  if (result.nModified === 0) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to update the order.");
  }

  const userNotification = await sendNotification(
    'Order Accepted by Driver',
    `Your order has been accepted by the driver. Thank you for your patience!`,
    order.user,  //userId
    null, //driverId
    orderId, //orderId
  );

  const driverNotification = await sendNotification(
    'New Order Acceptance',
    `You have a new order to accept. Please ensure to pick up the fuel!`,
    null, //userId
    userId, //driverId
    orderId, //orderId
  );

  await emitNotification(order.user, userNotification);
  await emitNotification(userId, driverNotification);

  return {
    orderId,
  };
};

// ----update driver progress by order-----------
const updateDriverByOrderStatus = async (req) => {
  const orderId = req.params.orderId;
  const status = req.body.status;
  const { userId } = req.user

  if (!status || !Object.values(ENUM_JOB_STATUS).includes(status)) {
    throw new ApiError(400, "Valid status is required!");
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, "Order not found!");
  }

  if (order.status === status) {
    throw new ApiError(httpStatus.CONFLICT, `${status}, This order status is already exist.`);
  }

  const result = await Order.findByIdAndUpdate(
    { _id: orderId },
    { status },
    { new: true }
  );

  if (!result) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to update the order.");
  }

  if (status === "delivered") {
    const userNotification = await sendNotification(
      'Your Order Delivered',
      `Your order has been delivered. Thank you for your patience!`,
      order.user,  //userId
      null, //driverId
      orderId, //orderId
    );
    const driverNotification = await sendNotification(
      'Order Delivered',
      `You have successfully delivered an order.`,
      null, //userId
      userId, //driverId
      orderId, //orderId
    );

    await emitNotification(order.user, userNotification);
    await emitNotification(userId, driverNotification);

  }

  return {
    message: `Trip update by status ${result.status} successfully`,
    orderId: result._id,
  };


};

// ----driver trip history ----------- 
const driverOrderHistory = async (req) => {
  const { userId } = req.user;

  const trips = await Order.find({ confirmedDriver: userId, status: "delivered" });

  if (!trips || trips.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No trip history found!");
  }

  return trips;
};

// ----driver trip history ----------- 
const userOrderHistory = async (req) => {
  const { userId } = req.user;

  const order = await Order.find({ user: userId });

  if (!order || order.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No trip history found!");
  }

  return order;
};

// ----driver transaction history ----------- 
const driverTransitionHistory = async (req) => {
  const { userId } = req.user;

  const transaction = await Transaction.find({ driver: userId, type: "send-driver-fee" });

  if (!transaction || transaction.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "You have no history yat!");
  }

  return transaction;
};

// ----driver transaction history ----------- 
const driverTransactionHistory = async (req) => {
  const { userId } = req.user;

  const currentDate = new Date();
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const startOfSpecifiedMonth = startOfMonth(new Date(year, month - 1));
  const endOfSpecifiedMonth = endOfMonth(new Date(year, month - 1));

  const totalTransactions = await Transaction.find({
    driver: userId,
    type: "send-driver-fee",
    date: { $gte: startOfSpecifiedMonth, $lte: endOfSpecifiedMonth }
  }).populate({
    path: 'orderId',
    select: '_id user deliveryAddress',
    populate: {
      path: 'user',
      model: 'User',
      select: '_id name profile_image'
    }
  });

  const transactions = await Transaction.find({
    driver: userId,
    type: "send-driver-fee",
    date: { $gte: startOfSpecifiedMonth, $lte: endOfSpecifiedMonth }
  });

  if (!transactions || transactions.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "You have no history for this month!");
  }
  const currentMonthOfAmount = transactions.reduce((sum, transaction) => {
    return sum + transaction.amount;
  }, 0);

  const currentMonth = format(startOfSpecifiedMonth, 'MMMM yyyy');

  return { currentMonthOfAmount, currentMonth, totalTransactions };
};








const orderService = {
  createOrderIntoDB,
  getOrderForTrip,
  getSingleOrderDetails,
  cancelOrderUser,
  acceptDriverOrder,
  updateDriverByOrderStatus,
  driverOrderHistory,
  userOrderHistory,
  driverTransitionHistory,
  driverTransactionHistory

};

module.exports = { orderService };