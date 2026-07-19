const express = require("express");
const router = express.Router();

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

// =====================
// Public Routes
// =====================

router.get("/", getProducts);
router.get("/featured", getFeaturedProducts);
router.get("/:id", getProduct);

// =====================
// Admin Routes
// Supports:
// 1. Image File Upload
// 2. Image URL
// =====================

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