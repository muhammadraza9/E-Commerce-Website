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

// Get All Products
router.get("/", getProducts);

// Get Featured Products
router.get("/featured", getFeaturedProducts);

// Get Single Product
router.get("/:id", getProduct);

// Add Product
router.post("/", createProduct);

// Update Product
router.put("/:id", updateProduct);

// Delete Product
router.delete("/:id", deleteProduct);

module.exports = router;