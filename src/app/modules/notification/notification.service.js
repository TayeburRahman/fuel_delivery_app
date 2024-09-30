const { ENUM_SOCKET_EVENT } = require("../../../utils/enums");
const Notification = require("./notification.model");

 

const handleNotification = async (receiverId, role, socket, io) => {
 
    // get all notifications 
    socket.on(ENUM_SOCKET_EVENT.NOTIFICATION, async (data) => { 
      console.log("get all notification:", role , receiverId);

      const filter = role === ENUM_USER_ROLE.USER 
        ? { user: receiverId } 
        : role === ENUM_USER_ROLE.DRIVER 
          ? { driver: receiverId } 
          : null; 
    
      if (filter) { 
        await Notification.updateMany(filter, { $set: { seen: true } });
        const notifications = await Notification.find(filter);

        io.to(receiverId).emit(ENUM_SOCKET_EVENT.NOTIFICATION, notifications);
      } else { 
        console.error("Invalid role provided:", role);
      }
    });

  // update seen notifications 
  socket.on(ENUM_SOCKET_EVENT.SEEN_NOTIFICATION, async (data) => { 
    console.log("seen notification:", role , receiverId);
    const filter = role === ENUM_USER_ROLE.USER 
      ? { user: receiverId } 
      : role === ENUM_USER_ROLE.DRIVER 
        ? { driver: receiverId } 
        : null; 

    if (filter) { 
      await Notification.updateMany(filter, { $set: { seen: true } });
      const notifications = await Notification.find(filter);

      io.to(receiverId).emit(ENUM_SOCKET_EVENT.NOTIFICATION, notifications);
    } else { 
      console.error("Invalid role provided:", role);
    }
  });
 
};
 
// Send notification function
const sendNotification = async (title, message, userId, driverId) => {
  try {
    const notification = await Notification.create({
      title,
      driverId,
      userId,
      message,
    }); 

    return notification;  
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

const emitNotification = (receiver, notification) => {
  if (global.io) {
    const socketIo = global.io;
    socketIo.to(receiver.toString()).emit('notification', notification); 
  } else {
    console.error('Socket.IO is not initialized');
  }
};


module.exports = { handleNotification, sendNotification, emitNotification};
