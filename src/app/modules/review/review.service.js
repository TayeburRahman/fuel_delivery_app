const Review = require("./review.model");

const createReviewIntoDB = async (user, payload) => {
  payload.user = user?.userId;
  const result = await Review.create(payload);
  return result;
};

// get my review
const getMyReviewFromDB = async (user) => {
  const result = await Review.find({ driver: user?.userId });
  return result;
};

// get reviews for a specific driver
const getReviewForSpecificDriverFromDB = async (driverId) => {
  const result = await Review.find({ driver: driverId });
  return result;
};

const reviewService = {
  createReviewIntoDB,
  getMyReviewFromDB,
  getReviewForSpecificDriverFromDB,
};

module.exports = reviewService;
