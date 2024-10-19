const catchAsync = require("../../../shared/catchasync");
const sendResponse = require("../../../shared/sendResponse");
const PaymentService = require("../payment/payment.service");


const createConnectedAccountWithBank = catchAsync(async (req, res) => {
  const result = await PaymentService.createConnectedAccountWithBank(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment transferred successfully",
    data: result,
  })
})

const updateConnectedAccountWithBank = catchAsync(async (req, res) => {
  const result = await PaymentService.updateConnectedAccountWithBank(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment transferred successfully",
    data: result,
  })
})

const TransferBallance = catchAsync(async (req, res) => {
  const result = await PaymentService.TransferBallance(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment transferred successfully",
    data: result,
  })
})


const createPaymentIntent = catchAsync(async (req, res) => {
  // const result = await PaymentService.createPaymentIntent(req.body);

  // sendResponse(res, {
  //   statusCode: 200,
  //   success: true,
  //   message: "Payment intent created successfully",
  //   data: result,
  // });
});

// const savePaymentUpdateSpending = catchAsync(async (req, res) => {
//   const result = await PaymentService.savePaymentUpdateSpending(req.body);

//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: "You payment is saved. Total spend amount updated successfully",
//     data: result,
//   });
// });

// const updateTotalEarning = catchAsync(async (req, res) => {
//   const result = await PaymentService.updateTotalEarning(req.body);

//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: "Total earning amount updated successfully",
//     data: result,
//   });
// });

const PaymentController = { 
  // savePaymentUpdateSpending,
  // updateTotalEarning,
  updateConnectedAccountWithBank,
  createConnectedAccountWithBank,
  TransferBallance
};

module.exports = PaymentController;
