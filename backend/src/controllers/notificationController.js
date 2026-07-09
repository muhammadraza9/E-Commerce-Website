const prisma = require("../config/db");

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({
      message: "Failed to load notifications",
      error: err.message,
    });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await prisma.notification.count({
      where: { isRead: false },
    });

    res.json({ count });
  } catch (err) {
    res.status(500).json({
      message: "Failed to load unread count",
      error: err.message,
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await prisma.notification.update({
      where: { id: Number(req.params.id) },
      data: { isRead: true },
    });

    res.json({ message: "Notification marked as read" });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update notification",
      error: err.message,
    });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });

    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update notifications",
      error: err.message,
    });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    await prisma.notification.delete({
      where: { id: Number(req.params.id) },
    });

    res.json({ message: "Notification deleted" });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete notification",
      error: err.message,
    });
  }
};

exports.clearNotifications = async (req, res) => {
  try {
    await prisma.notification.deleteMany();

    res.json({ message: "All notifications cleared" });
  } catch (err) {
    res.status(500).json({
      message: "Failed to clear notifications",
      error: err.message,
    });
  }
};