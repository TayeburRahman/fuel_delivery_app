const catchAsync = require("../../../shared/catchasync");
const sendResponse = require("../../../shared/sendResponse");
const reviewService = require("./review.service");

const createReview = catchAsync(async (req, res) => {
  const result = await reviewService.createReviewIntoDB(req?.user, req?.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Review created successfully",
    data: result,
  });
});
const getMyReviews = catchAsync(async (req, res) => {
  const result = await reviewService.getMyReviewFromDB(req?.user);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Review retrieved successfully",
    data: result,
  });
});
const getReviewForSpecificDriver = catchAsync(async (req, res) => {
  const result = await reviewService.getReviewForSpecificDriverFromDB(
    req?.params?.driverId
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Review retrieved successfully",
    data: result,
  });
});

const reviewController = {
  createReview,
  getMyReviews,
  getReviewForSpecificDriver,
};

module.exports = reviewController;
