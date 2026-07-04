const express = require("express");
const router = express.Router();

const {
  getProductReviews,
  addReview,
  deleteReview,
} = require("../controllers/reviewController");

const { verifyToken } = require("../middleware/authMiddleware");

router.get("/product/:productId", getProductReviews);
router.post("/", verifyToken, addReview);
router.delete("/:id", verifyToken, deleteReview);

module.exports = router;