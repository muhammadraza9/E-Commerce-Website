const prisma = require("../config/db");

// ===============================
// Get All Products
// ===============================
const getProducts = async (req, res) => {
  try {
    console.log("===== STEP 1 =====");

    const count = await prisma.product.count();
    console.log("===== STEP 2 =====");
    console.log("Total Products:", count);

    const products = await prisma.product.findMany();
    console.log("===== STEP 3 =====");

    res.status(200).json(products);
  } catch (err) {
    console.log("===== ERROR =====");
    console.error(err);

    res.status(500).json({
      message: "Server Error",
      error: err.message,
    });
  }
};
// ===============================
// Get Single Product
// ===============================
const getProduct = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json(product);
  } catch (err) {
    console.error("GET PRODUCT ERROR");
    console.error(err);

    res.status(500).json({
      message: "Server Error",
      error: err.message,
    });
  }
};

// ===============================
// Create Product
// ===============================
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      image,
      price,
      category,
    } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        image,
        price: Number(price),
        category: category || "Clothing",
      },
    });

    res.status(201).json(product);
  } catch (err) {
    console.error("CREATE PRODUCT ERROR");
    console.error(err);

    res.status(500).json({
      message: "Server Error",
      error: err.message,
    });
  }
};

// ===============================
// Update Product
// ===============================
const updateProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      image,
      price,
      category,
    } = req.body;

    const product = await prisma.product.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        name,
        description,
        image,
        price: Number(price),
        category,
      },
    });

    res.status(200).json(product);
  } catch (err) {
    console.error("UPDATE PRODUCT ERROR");
    console.error(err);

    res.status(500).json({
      message: "Server Error",
      error: err.message,
    });
  }
};

// ===============================
// Delete Product
// ===============================
const deleteProduct = async (req, res) => {
  try {
    await prisma.product.delete({
      where: {
        id: Number(req.params.id),
      },
    });

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (err) {
    console.error("DELETE PRODUCT ERROR");
    console.error(err);

    res.status(500).json({
      message: "Server Error",
      error: err.message,
    });
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};