const express = require('express');  
const { ENUM_SOCKET_EVENT } = require('../utils/enums');
const {handleNotification} = require('../app/modules/notification/notification.service');
const { handleDriverData } = require('../app/modules/driver/driver.socket');
const { handleMessageData } = require('../app/modules/message/meassage.socket');

 
// Set to keep track of online users
const onlineUsers = new Set();

const socket = async (io) => {
  io.on(ENUM_SOCKET_EVENT.CONNECT, async (socket) => {
    const currentUserId = socket.handshake.query.id;
    const role = socket.handshake.query.role;

    socket.join(currentUserId);
    console.log("A user connected", currentUserId);

    // Add the user to the online users set
    onlineUsers.add(currentUserId);
    io.emit("onlineUser", Array.from(onlineUsers));

    // Handle massage events
    await handleMessageData(currentUserId, role, socket, io)

    // Handle notifications events
    await handleNotification(currentUserId, role, socket, io);

    // Handle driver events
    await handleDriverData(currentUserId, role, socket, io)

    // Handle chat functionality (uncomment if needed)
    // handleChat(io, socket, currentUserId, onlineUsers);

    // Handle user disconnection
    socket.on("disconnect", () => {
      console.log("A user disconnected", currentUserId);
      onlineUsers.delete(currentUserId); // Remove user from online users
      io.emit("onlineUser", Array.from(onlineUsers)); // Update online user list
    });
  });
};

// Export the socket initialization function
module.exports = socket;
