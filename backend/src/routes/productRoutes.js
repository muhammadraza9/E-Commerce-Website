const express = require("express");
const router = express.Router();

const {
getProducts,
getProduct,
createProduct,
updateProduct,
deleteProduct,
} = require("../controllers/productController");

// Get All Products

router.get("/", getProducts);

// Get Single Product

router.get("/:id", getProduct);

// Add Product

router.post("/", createProduct);

// Update Product

router.put("/:id", updateProduct);

// Delete Product

router.delete("/:id", deleteProduct);

module.exports = router;
