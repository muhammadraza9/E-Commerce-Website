const prisma = require("../config/db");

exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await prisma.review.findMany({
      where: {
        productId: parseInt(productId),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalRating = reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );

    const averageRating =
      reviews.length > 0 ? Number((totalRating / reviews.length).toFixed(1)) : 0;

    res.json({
      reviews,
      averageRating,
      totalReviews: reviews.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, rating, comment } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({
        message: "Product, rating and comment are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    const review = await prisma.review.upsert({
      where: {
        userId_productId: {
          userId,
          productId: parseInt(productId),
        },
      },
      update: {
        rating: parseInt(rating),
        comment,
      },
      create: {
        userId,
        productId: parseInt(productId),
        rating: parseInt(rating),
        comment,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Review saved successfully",
      review,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    const review = await prisma.review.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    if (review.userId !== userId && role !== "ADMIN") {
      return res.status(403).json({
        message: "Not allowed to delete this review",
      });
    }

    await prisma.review.delete({
      where: {
        id: parseInt(id),
      },
    });

    res.json({
      message: "Review deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};