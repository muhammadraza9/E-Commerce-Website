const express = require("express");
const router = express.Router();

const {
  createOrder,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  getStats,
  getMyOrders,
  getMyOrderById,
  cancelMyOrder,
} = require("../controllers/orderController");

const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

// ==========================
// Customer Orders
// ==========================

router.post("/", verifyToken, createOrder);
router.get("/my", verifyToken, getMyOrders);
router.get("/my/:id", verifyToken, getMyOrderById);
router.put("/my/:id/cancel", verifyToken, cancelMyOrder);

// ==========================
// Admin Orders
// ==========================

router.get("/", verifyToken, verifyAdmin, getAllOrders);
router.get("/stats/dashboard", verifyToken, verifyAdmin, getStats);
router.put("/:id/status", verifyToken, verifyAdmin, updateOrderStatus);

// ==========================
// Public Tracking
// ==========================

router.get("/track/:trackingId", getOrder);

module.exports = router;