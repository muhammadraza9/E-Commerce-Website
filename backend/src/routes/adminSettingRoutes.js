
const express = require("express");
const router = express.Router();

const {
  getAdminSettings,
  updateAdminSettings,
} = require("../controllers/adminSettingController");

const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

// ==========================
// Admin Settings
// ==========================

// Get Admin Settings (Public - for footer)
router.get("/", getAdminSettings);

// Update Admin Settings (Admin Only)
router.put("/", verifyToken, verifyAdmin, updateAdminSettings);

module.exports = router;
