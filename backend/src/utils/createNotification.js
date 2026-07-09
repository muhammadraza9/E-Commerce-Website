const prisma = require("../config/db");

const createNotification = async ({ title, message, type = "INFO" }) => {
  try {
    await prisma.notification.create({
      data: {
        title,
        message,
        type,
      },
    });
  } catch (err) {
    console.error("Notification create error:", err.message);
  }
};

module.exports = createNotification;