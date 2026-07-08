const express = require("express");
const router = express.Router();

const {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
} = require("../controllers/couponController");

const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

router.post("/apply", applyCoupon);

router.get("/", verifyToken, verifyAdmin, getCoupons);
router.post("/", verifyToken, verifyAdmin, createCoupon);
router.put("/:id", verifyToken, verifyAdmin, updateCoupon);
router.delete("/:id", verifyToken, verifyAdmin, deleteCoupon);

module.exports = router;