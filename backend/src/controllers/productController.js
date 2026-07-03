const prisma = require("../config/db");

// ===============================
// Get All Products + Search + Filter + Sort + Pagination
// ===============================

const getProducts = async (req, res) => {

    return res.json({
    message: "NEW DEPLOY WORKING",
    query: req.query,
  });

  try {
    const {
      search = "",
      category = "",
      sort = "newest",
      page = 1,
      limit = 12,
    } = req.query;

    const where = {};

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
          },
        },
        {
          description: {
            contains: search,
          },
        },
      ];
    }

    if (category && category !== "All") {
      where.category = category;
    }

    // ===============================
    // DEBUG LOGS
    // ===============================

    console.log("=================================");
    console.log("REQ QUERY:", req.query);
    console.log("SEARCH:", search);
    console.log("CATEGORY:", category);
    console.log("SORT:", sort);
    console.log("PAGE:", page);
    console.log("LIMIT:", limit);
    console.log("WHERE:", JSON.stringify(where, null, 2));
    console.log("=================================");

    // ===============================
    // Sorting Logic
    // ===============================

    let orderBy = { createdAt: "desc" };

    if (sort === "price_asc") {
      orderBy = { price: "asc" };
    } else if (sort === "price_desc") {
      orderBy = { price: "desc" };
    } else if (sort === "oldest") {
      orderBy = { createdAt: "asc" };
    } else if (sort === "newest") {
      orderBy = { createdAt: "desc" };
    }

    // ===============================
    // Pagination Logic
    // ===============================

    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.max(Number(limit) || 12, 1);
    const skip = (pageNumber - 1) * limitNumber;

    const [products, totalProducts] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limitNumber,
      }),
      prisma.product.count({ where }),
    ]);

    console.log("FOUND PRODUCTS:", products.length);

    const totalPages = Math.ceil(totalProducts / limitNumber);

    res.status(200).json({
      products,
      currentPage: pageNumber,
      totalPages,
      totalProducts,
    });
  } catch (err) {
    console.error("GET PRODUCTS ERROR:", err);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// ===============================
// Get Single Product
// ===============================

const getProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const product = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json(product);
  } catch (err) {
    console.error("GET PRODUCT ERROR:", err);

    res.status(500).json({
      message: "Server Error",
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
    console.error("CREATE PRODUCT ERROR:", err);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// ===============================
// Update Product
// ===============================

const updateProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const {
      name,
      description,
      image,
      price,
      category,
    } = req.body;

    const product = await prisma.product.update({
      where: {
        id,
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
    console.error("UPDATE PRODUCT ERROR:", err);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// ===============================
// Delete Product
// ===============================

const deleteProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.product.delete({
      where: {
        id,
      },
    });

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (err) {
    console.error("DELETE PRODUCT ERROR:", err);

    res.status(500).json({
      message: "Server Error",
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