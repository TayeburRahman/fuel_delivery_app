const { Schema, default: mongoose } = require("mongoose");

const reviewSchema = new Schema(
  {
    driver: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Driver",
    },
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    rating: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
