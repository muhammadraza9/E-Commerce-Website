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

// Dashboard Stats
router.get("/stats/dashboard", getStats);

// User Order History
router.get("/user/:email", getMyOrders);

// Order Detail By ID
router.get("/id/:id", getOrderById);

// Create Order
router.post("/", createOrder);

// Get All Orders
router.get("/", getAllOrders);

// Track Order
router.get("/:trackingId", getOrder);

// Update Order Status
router.put("/:id/status", updateOrderStatus);

// Cancel Order
router.put("/:id/cancel", cancelOrder);

module.exports = router;