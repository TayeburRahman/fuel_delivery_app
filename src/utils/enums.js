const ENUM_USER_ROLE = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  USER: "USER",
  DRIVER: "DRIVER",
};

const ENUM_JOB_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted", 
  PICKED: "picked",
  IN_PROGRESS: "in-progress",
  COMPLETED: "delivered",
  // END: "end",
  CANCELED: "canceled",
};

const ENUM_SOCKET_EVENT = {
  CONNECT: "connection",
  NOTIFICATION: "notification",
  NEW_NOTIFICATION: "new-notification",
  SEEN_NOTIFICATION: "seen-notification",
  MESSAGE_NEW: "new-message",
  MESSAGE_GETALL: "message",
  CONVERSION: "conversion", 
  
  
};

const ENUM_NOTIFICATION_TYPE = {
  PARCEL_PICKED: "parcel_picked",
  PARCEL_DELIVERED: "parcel_delivered",
  MESSAGE: "message",
  SERVER_ERROR: "error",
  MESSAGE: "message",
};

module.exports = {
  ENUM_USER_ROLE,
  ENUM_JOB_STATUS,
  ENUM_NOTIFICATION_TYPE,
  ENUM_SOCKET_EVENT,
};
