const {mongoose,  Schema } = require("mongoose");
  
const transactionSchema = new Schema({
  orderId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Order",
  }, 
  driver: {
    type: Schema.Types.ObjectId, 
    ref: "Driver",
  }, 
  user: {
    type: Schema.Types.ObjectId, 
    ref: "User",
  }, 
  transactionId: {
    type: String,
    required: true, 
  },
  date:{
    type: Date,
    required: true,
  },
  type: {
    type: String,
    required: true, 
    enum: [ "pay-order", "send-driver-fee" ],
  },
  amount: {
    type: Number,
    required: true, 
  }, 
  payment: {
    type: String, 
    enum: [ "stripe",  "bank",   ],
  },
  status: {
    type: String, 
    enum: [ "pending", "success" ],
  }, 
   
});

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;