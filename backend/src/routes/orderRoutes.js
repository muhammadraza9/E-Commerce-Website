const express = require("express");
const router = express.Router();

const {
  createOrder,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  getStats,
  getMyOrders,
  getOrderById,
  cancelOrder,
} = require("../controllers/orderController");

const {
  verifyToken,
  verifyAdmin,
} = require("../middleware/authMiddleware");

// ==========================
// Customer
// ==========================

router.post("/", verifyToken, createOrder);
router.get("/user/:email", verifyToken, getMyOrders);
router.get("/id/:id", verifyToken, getOrderById);
router.put("/:id/cancel", verifyToken, cancelOrder);
router.get("/:trackingId", getOrder);

// ==========================
// Admin
// ==========================

router.get("/", verifyToken, verifyAdmin, getAllOrders);
router.get("/stats/dashboard", verifyToken, verifyAdmin, getStats);
router.put("/:id/status", verifyToken, verifyAdmin, updateOrderStatus);

module.exports = router;