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

router.get("/", verifyToken, verifyAdmin, getAdminSettings);
router.put("/", verifyToken, verifyAdmin, updateAdminSettings);

module.exports = router;