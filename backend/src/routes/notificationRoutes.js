const express = require("express");
const router = express.Router();

const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearNotifications,
} = require("../controllers/notificationController");

const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

router.get("/", verifyToken, verifyAdmin, getNotifications);
router.get("/unread-count", verifyToken, verifyAdmin, getUnreadCount);
router.patch("/:id/read", verifyToken, verifyAdmin, markAsRead);
router.patch("/read-all", verifyToken, verifyAdmin, markAllAsRead);
router.delete("/:id", verifyToken, verifyAdmin, deleteNotification);
router.delete("/", verifyToken, verifyAdmin, clearNotifications);

module.exports = router;