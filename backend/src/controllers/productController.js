const prisma = require("../config/db");
const createActivityLog = require("../utils/createActivityLog");

const getProductId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const parseStock = (value) => Math.max(Number(value || 0), 0);

const createAdminLog = (req, data) =>
  createActivityLog({
    adminId: req.user?.id,
    adminEmail: req.user?.email,
    ...data,
  });

const getProducts = async (req, res) => {
  try {
    const {
      search = "",
      category = "",
      featured = "",
      sort = "newest",
      page = 1,
      limit = 12,
    } = req.query;

    const currentPage = Math.max(Number.parseInt(page) || 1, 1);
    const pageLimit = Math.max(Number.parseInt(limit) || 12, 1);

    const where = {};

    if (search.trim()) {
      where.OR = [
        { name: { contains: search.trim() } },
        { description: { contains: search.trim() } },
      ];
    }

    if (category && category !== "All") {
      where.category = category;
    }

    if (featured === "true" || featured === "false") {
      where.featured = featured === "true";
    }

    const sortOptions = {
      oldest: { createdAt: "asc" },
      price_asc: { price: "asc" },
      price_desc: { price: "desc" },
      stock_low: { stock: "asc" },
      stock_high: { stock: "desc" },
      newest: { createdAt: "desc" },
    };

    const [products, totalProducts] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: sortOptions[sort] || sortOptions.newest,
        skip: (currentPage - 1) * pageLimit,
        take: pageLimit,
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products,
      currentPage,
      totalPages: Math.ceil(totalProducts / pageLimit),
      totalProducts,
    });
  } catch (error) {
    console.error("Get products error:", error.message);

    res.status(500).json({
      message: "Failed to load products",
    });
  }
};

const getFeaturedProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { featured: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(products);
  } catch (error) {
    console.error("Get featured products error:", error.message);

    res.status(500).json({
      message: "Failed to load featured products",
    });
  }
};

const getProduct = async (req, res) => {
  try {
    const id = getProductId(req.params.id);

    if (!id) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(product);
  } catch (error) {
    console.error("Get product error:", error.message);

    res.status(500).json({
      message: "Failed to load product",
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      image,
      price,
      category = "Clothing",
      featured = false,
      stock = 0,
    } = req.body;

    if (!name?.trim() || !description?.trim() || !image || price === undefined) {
      return res.status(400).json({
        message: "Name, description, image and price are required",
      });
    }

    const productPrice = Number(price);

    if (!Number.isFinite(productPrice) || productPrice < 0) {
      return res.status(400).json({
        message: "Invalid product price",
      });
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        image,
        price: productPrice,
        category,
        featured: Boolean(featured),
        stock: parseStock(stock),
      },
    });

    await createAdminLog(req, {
      action: "CREATE",
      entity: "PRODUCT",
      entityId: product.id,
      message: `Created product "${product.name}"`,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Create product error:", error.message);

    res.status(500).json({
      message: "Failed to create product",
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const id = getProductId(req.params.id);

    if (!id) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const {
      name,
      description,
      image,
      price,
      category,
      featured,
      stock,
    } = req.body;

    const data = {};

    if (name !== undefined) data.name = name.trim();
    if (description !== undefined) data.description = description.trim();
    if (image !== undefined) data.image = image;
    if (category !== undefined) data.category = category;
    if (featured !== undefined) data.featured = Boolean(featured);
    if (stock !== undefined) data.stock = parseStock(stock);

    if (price !== undefined) {
      const productPrice = Number(price);

      if (!Number.isFinite(productPrice) || productPrice < 0) {
        return res.status(400).json({
          message: "Invalid product price",
        });
      }

      data.price = productPrice;
    }

    const product = await prisma.product.update({
      where: { id },
      data,
    });

    await createAdminLog(req, {
      action: "UPDATE",
      entity: "PRODUCT",
      entityId: product.id,
      message: `Updated product "${product.name}"`,
    });

    res.json(product);
  } catch (error) {
    console.error("Update product error:", error.message);

    res.status(500).json({
      message: "Failed to update product",
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const id = getProductId(req.params.id);

    if (!id) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    await prisma.product.delete({
      where: { id },
    });

    await createAdminLog(req, {
      action: "DELETE",
      entity: "PRODUCT",
      entityId: product.id,
      message: `Deleted product "${product.name}"`,
    });

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error.message);

    res.status(500).json({
      message: "Failed to delete product",
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