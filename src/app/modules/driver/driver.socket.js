const { ENUM_SOCKET_EVENT, ENUM_USER_ROLE } = require("../../../utils/enums");
const Order = require("../order/order.modal");
const Driver = require("./driver.model"); 



const handleDriverData = async (receiverId, role, socket, io) => {

    // update driver information of location 
    socket.on(ENUM_SOCKET_EVENT.DRIVER_LOCATION, async (data) => {

        const { latitude, longitude, address } = data;

        if (!receiverId || !data.longitude || !data.latitude) {
            socket.emit('error', {
                message: 'longitude or latitude not found',
            });
        }

        const updatedDriver = await Driver.findByIdAndUpdate(
            receiverId,
            {
                $set: { location: { latitude, longitude, address } },
            },
            { new: true },
        );

        if (!updatedDriver) {
            throw new ApiError(httpStatus.NOT_FOUND, 'Driver not found!');
        }

        const { location } = updatedDriver;

        const order = await Order.findOne({
            confirmedDriver: receiverId,
            status: 'accepted',
        });

        if (order) {
            io.to(order?.user.toString()).emit(ENUM_SOCKET_EVENT.DRIVER_LOCATION, location);
            io.to(receiverId.toString()).emit(ENUM_SOCKET_EVENT.DRIVER_LOCATION, location);
        }
    },
    );

};

// Send notification function
// const sendNotification = async (title, message, userId, driverId, orderId) => {
//     try {
//         const notification = await Notification.create({
//             title,
//             driverId,
//             userId,
//             message,
//             orderId,
//         });

//         return notification;
//     } catch (error) {
//         console.error("Error sending notification:", error);
//     }
// };

// const emitNotification = (receiver, notification) => {
//     if (global.io) {
//         const socketIo = global.io;
//         socketIo.to(receiver.toString()).emit(ENUM_SOCKET_EVENT.NEW_NOTIFICATION, notification);
//     } else {
//         console.error('Socket.IO is not initialized');
//     }
// };

module.exports = {
    handleDriverData,
    //  sendNotification, 
    //  emitNotification 

}
