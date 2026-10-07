const Notification = require("../models/Notification");

let io = null;

const setSocketIO = (socketIO) => {
  io = socketIO;
};

const createNotification = async ({
  recipient,
  sender,
  type,
  title,
  message,
  relatedJob,
  relatedApplication,
  relatedInterview,
}) => {
  try {
    const notification =
      await Notification.create({
        recipient,
        sender,
        type,
        title,
        message,
        relatedJob,
        relatedApplication,
        relatedInterview,
      });

    // Send real-time notification
    if (io && recipient) {
      io.to(`user:${recipient}`).emit(
        "notification:new",
        notification
      );
    }

    return notification;
  } catch (error) {
    console.error(
      "Create notification error:",
      error
    );

    return null;
  }
};

module.exports = {
  setSocketIO,
  createNotification,
};