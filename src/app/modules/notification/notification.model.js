const { Schema, default: mongoose } = require("mongoose");
const { ENUM_NOTIFICATION_TYPE } = require("../../../utils/enums");

const notificationSchema = new Schema(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Job",
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    receiverId: {
      type: String,
      required: true,
    },
    otp: {
      type: Number,
      default: null,
    },
    seen: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: Object.values(ENUM_NOTIFICATION_TYPE),
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = new mongoose.model("Notification", notificationSchema);

module.exports = Notification;
