const mongoose = require("mongoose");
const { model } = require("mongoose");

// Fuel Schema
const fuelSchema = new mongoose.Schema(
  {
    fuelType: {
      type: String,
      required: true,
      unique: true,
    },
    pricePerLiter: {
      type: Number,
      required: true,
    },
    stockLevel: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['IN_STOCK', 'OUT_OF_STOCK'],   
      validate: {
        validator: function(value) {
          return ['IN_STOCK', 'OUT_OF_STOCK'].includes(value);
        },
        message: props => `${props.value} is invalid status value. It must be either 'IN_STOCK' or 'OUT_OF_STOCK'!`
      }
    },
  },
  {
    timestamps: true,
  }
);

module.exports = { 
  Fuel: model("Fuel", fuelSchema), 
};
