const catchAsync = require("../../../shared/catchasync");
const sendResponse = require("../../../shared/sendResponse");
const { notificationService } = require("./notification.service");

const sendMessage = async (req, res) => {
  const data = req.body; // Assuming data is coming from the request body
  // const result = await notificationService.sendMessage(data);
  // sendResponse(res, {
  //   statusCode: 200,
  //   success: true,
  //   message: 'Message sent successfully',
  //   data: result,
  // });
};

const getMessages = catchAsync(async (req, res) => {
  // const result = await notificationService.getMessages(req);
  // sendResponse(res, {
  //   statusCode: 200,
  //   success: true,
  //   data: result,
  // });
});

const conversationUser = catchAsync(async (req, res) => {
  // const result = await notificationService.conversationUser(req);
  // console.log('result', result);
  // sendResponse(res, {
  //   statusCode: 200,
  //   success: true,
  //   message: 'Conversation retrieved successfully',
  //   data: result,
  // });
});

// Export the notification controller
const notificationController = {
  sendMessage,
  getMessages,
  conversationUser,
};

module.exports = { notificationController };
