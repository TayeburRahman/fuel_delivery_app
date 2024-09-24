const Notification = require("../app/modules/notification/notification.model"); 

const handleNotification = async (currentUserId, socket, io) => {

  const getNotifications = async (currentUserId) => {
    // const currentUserNotification = await Notification.find({
    //   receiverId: currentUserId,
    // });
    // Filter notifications that are unseen
    // const unseenNotifications = currentUserNotification.filter(
    //   (noti) => !noti.seen
    // );
  
    const currentUserUnseenNotificationCount = await Notification.countDocuments({
      receiverId: currentUserId,
      seen: false,
    });
    return currentUserUnseenNotificationCount;
    // Return both unseen count and the notifications
    // return {
    //   unseenCount: unseenNotifications.length,
    //   notifications: currentUserNotification,
    // };
  };

  // socket.emit("notifications", notifications);
  // seen notification
  socket.on("seen-notification", async (receiverId) => {
    const updateNotification = await Notification.updateMany(
      { receiverId },
      { $set: { seen: true } }
    );

    const notifications = await getNotifications(receiverId);
    io.to(receiverId).emit("notifications", notifications);
  });
};

module.exports = handleNotification;
