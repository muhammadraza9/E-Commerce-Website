const prisma = require("../config/db");

// ===============================
// Get All Products + Search + Filter + Sort + Pagination
// ===============================

const getProducts = async (req, res) => {
  try {
    const {
      search = "",
      category = "",
      sort = "newest",
      page = 1,
      limit = 12,
    } = req.query;

    const pageNumber = Math.max(parseInt(page) || 1, 1);
    const limitNumber = Math.max(parseInt(limit) || 12, 1);
    const skip = (pageNumber - 1) * limitNumber;

    const where = {};

    // Search

    if (search.trim()) {
      where.OR = [
        {
          name: {
            contains: search.trim(),
          },
        },
        {
          description: {
            contains: search.trim(),
          },
        },
      ];
    }

    // Category

    if (category && category !== "All") {
      where.category = category;
    }

    // Sorting

    let orderBy = {
      createdAt: "desc",
    };

    switch (sort) {
      case "oldest":
        orderBy = {
          createdAt: "asc",
        };
        break;

      case "price_asc":
        orderBy = {
          price: "asc",
        };
        break;

      case "price_desc":
        orderBy = {
          price: "desc",
        };
        break;

      default:
        orderBy = {
          createdAt: "desc",
        };
    }

    const [products, totalProducts] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limitNumber,
      }),

      prisma.product.count({
        where,
      }),
    ]);

    res.status(200).json({
      products,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalProducts / limitNumber),
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
// Get Featured Products
// ===============================

const getFeaturedProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        featured: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(products);
  } catch (err) {
    console.error("GET FEATURED PRODUCTS ERROR:", err);

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
      featured,
    } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        image,
        price: Number(price),
        category: category || "Clothing",
        featured: featured || false,
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
      featured,
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
        featured,
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
  getFeaturedProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};