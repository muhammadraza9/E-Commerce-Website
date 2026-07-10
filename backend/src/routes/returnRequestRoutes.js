const express = require("express");
const router = express.Router();

const {
  createReturnRequest,
  getReturnRequests,
  getMyReturnRequests,
  updateReturnRequestStatus,
  deleteReturnRequest,
} = require("../controllers/returnRequestController");

const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

// ==========================
// Customer Returns
// ==========================

router.post("/", verifyToken, createReturnRequest);
router.get("/my", verifyToken, getMyReturnRequests);

// ==========================
// Admin Returns
// ==========================

router.get("/", verifyToken, verifyAdmin, getReturnRequests);
router.patch("/:id/status", verifyToken, verifyAdmin, updateReturnRequestStatus);
router.delete("/:id", verifyToken, verifyAdmin, deleteReturnRequest);

module.exports = router;