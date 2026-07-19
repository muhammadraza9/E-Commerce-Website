const express = require("express");

const {
  getProducts,
  getFeaturedProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const {
  verifyToken,
  verifyAdmin,
} = require("../middleware/authMiddleware");

const productImageUpload = require("../middleware/productImageUpload");

const router = express.Router();

// ==========================================
// Public Product Routes
// ==========================================

router.get("/", getProducts);

router.get("/featured", getFeaturedProducts);

router.get("/:id", getProduct);

// ==========================================
// Admin Product Routes
// Supports:
// 1. Multipart image file upload
// 2. External image URL
// ==========================================

router.post(
  "/",
  verifyToken,
  verifyAdmin,
  productImageUpload.single("image"),
  createProduct
);

router.put(
  "/:id",
  verifyToken,
  verifyAdmin,
  productImageUpload.single("image"),
  updateProduct
);

router.delete(
  "/:id",
  verifyToken,
  verifyAdmin,
  deleteProduct
);

module.exports = router;