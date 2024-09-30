const {mongoose,  Schema } = require("mongoose");
  
const orderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  fuelId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Fuel",
  }, 
  literQuantity: {
    type: Number,
    required: true, 
  },
  deliveryAddress: {
    type: String,
    required: true, 
  },
  phoneNumber: {
    type: String,
    required: true, 
  },  
  confirmedDriver: {
    type: Schema.Types.ObjectId,
    ref: "Driver", 
  },
  amount: {
    type: Number, 
    required: true, 
  },
  deliveryFee:{
    type: Number, 
    required: true, 
  },
  stripId: {
    type: String, 
    required: true, 
  },
  payment: {
    type: String,
    default: "unpaid",
    enum: [
      "paid",
      "unpaid",   
    ],
  },
  status: {
    type: String,
    default: "pending",
    enum: [
      "pending",
      "accepted", 
      "pickup", 
      "in-progress",
      "delivered",
      "canceled",
    ],
  }, 
   
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;