const express = require("express");
const router = express.Router();

const {
  getActivityLogs,
  deleteActivityLog,
  clearActivityLogs,
} = require("../controllers/activityLogController");

const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

// ==========================
// Admin Activity Logs
// ==========================

router.get("/", verifyToken, verifyAdmin, getActivityLogs);
router.delete("/:id", verifyToken, verifyAdmin, deleteActivityLog);
router.delete("/", verifyToken, verifyAdmin, clearActivityLogs);

module.exports = router;