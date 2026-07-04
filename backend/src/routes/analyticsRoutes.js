const express = require("express");
const router = express.Router();

const {
  getDashboardAnalytics,
} = require("../controllers/analyticsController");

const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

router.get("/dashboard", verifyToken, verifyAdmin, getDashboardAnalytics);

module.exports = router;