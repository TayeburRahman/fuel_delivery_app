const Notification = require("./notification.model");

const getAllNotificationFromDB = async (user) => {
  const result = await Notification.find({ receiverId: user?.userId });
  return result;
};

const notificationService = {
  getAllNotificationFromDB,
};

module.exports = { notificationService };
