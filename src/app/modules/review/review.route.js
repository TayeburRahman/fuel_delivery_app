const express = require("express");
const reviewController = require("./review.controller");
const auth = require("../../middlewares/auth");
const { ENUM_USER_ROLE } = require("../../../utils/enums");

const router = express.Router();

router.post(
  "/create-review",
  auth(ENUM_USER_ROLE.USER),
  reviewController.createReview
);
router.get(
  "/my-reviews",
  auth(ENUM_USER_ROLE.DRIVER),
  reviewController.getMyReviews
);
router.get(
  "/driver-reviews/:driverId",
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.ADMIN),
  reviewController.getReviewForSpecificDriver
);

module.exports = router;
