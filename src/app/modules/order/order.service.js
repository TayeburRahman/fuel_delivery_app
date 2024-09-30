const httpStatus = require("http-status");
const ApiError = require("../../../errors/ApiError");
const Order = require("./order.modal");
const { ENUM_JOB_STATUS } = require("../../../utils/enums");
const Transaction = require("./transaction.modal");
const { sendNotification, emitNotification } = require("../notification/notification.service");

const createOrderIntoDB = async (userId, payload) => {
  payload.user = userId;
  if (!payload.stripId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Payment ID is required to create your order.");
  } else {
    payload.payment = "paid";
  }
  const result = await Order.create(payload);
  if (!result) {
    await sendNotification(
      'Order Creation Failed',
      `Unable to create your order. Please contact support with Transaction ID: ${payload.stripId}.`,
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
    transactionType: "pay-order",
    totalAmount: payload.amount,
    payment: "stripe",
    status: "success"
  };

  const transaction = await Transaction.create(order);

  if (!transaction) {
    await sendNotification(
      'Failed to create transaction.',
      `Your order was created, but the transaction failed. Please contact support with Transaction ID: ${payload.stripId}.`,
      userId
    );
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to create the transaction. Please contact our support.");
  }

  const userNotification = await sendNotification(
    'New Order Created',
    `You have successfully created a new order. Order ID: ${result._id}.`,
    userId
  );
  const paymentNotification = await sendNotification(
    'Order Payment Successful',
    `Your payment of $${payload.amount} has been successfully processed. Transaction ID: ${payload.stripId}`,
    userId
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

  return {
    orderId,
  };
};

// ----update driver progress by order-----------
const updateDriverByOrderStatus = async (orderId, status) => {

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






const confirmTripByUser = async (orderId, driverId) => {
  const trip = await Order.findById(orderId);
  if (trip?.status !== "accepted") {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You can not confirm the order before driver accept the trip"
    );
  }
  const result = await Order.updateOne(
    { _id: orderId },
    { status: "confirmed", confirmedDriver: driverId }
  );
  return result;
};

// complete destination
const completedDestination = async (orderId) => {
  const trip = await Order.findById(orderId);

  if (!trip) {
    return res.status(404).send({ message: "trip not found" });
  }

  const currentIndex = trip.currentDestinationIndex;

  // Check if the current destination is already completed
  if (trip.dropOffDestination[currentIndex].completed) {
    return res.status(400).send({ message: "Destination already completed" });
  }

  // Mark the current destination as completed and set the end time
  trip.dropOffDestination[currentIndex].completed = true;
  trip.dropOffDestination[currentIndex].endTime = new Date();

  // Increment the currentDestinationIndex to move to the next destination, if any
  if (currentIndex + 1 < trip.dropOffDestination.length) {
    trip.currentDestinationIndex += 1;
  } else {
    // If no more destinations, mark the trip as completed
    trip.status = "completed";
  }

  await Order.save();

  res.send({ message: "Destination marked as completed", trip });
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


  completedDestination,
  confirmTripByUser,

};

module.exports = { orderService };