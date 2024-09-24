const ENUM_USER_ROLE = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  USER: "USER",
  DRIVER: "DRIVER",
};

const ENUM_JOB_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  CONFIRMED: "confirmed",
  ARRIVED: "arrived",
  PICKED: "picked",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
  END: "end",
  CANCELED: "canceled",
};

const ENUM_NOTIFICATION_TYPE = {
  PARCEL_PICKED: "parcel_picked",
  PARCEL_DELIVERED: "parcel_delivered",
  MESSAGE: "message",
};

module.exports = {
  ENUM_USER_ROLE,
  ENUM_JOB_STATUS,
  ENUM_NOTIFICATION_TYPE,
};
