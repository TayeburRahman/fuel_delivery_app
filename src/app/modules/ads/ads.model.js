const mongoose = require("mongoose");
const { model } = require("mongoose");

const fuelSchema = new mongoose.Schema(
    {
      order: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
      isPrivate: {
        type: Boolean,
        default: false,
      },
      isActive: {
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: true,
    },
  );

  module.exports = { 
    Banner: model("Banner", fuelSchema), 
  };