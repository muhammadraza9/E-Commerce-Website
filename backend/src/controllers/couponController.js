const prisma = require("../config/db");

exports.getCoupons = async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: "Failed to load coupons" });
  }
};

exports.createCoupon = async (req, res) => {
  try {
    const {
      code,
      type,
      value,
      minimumOrder,
      expiryDate,
      usageLimit,
      isActive,
    } = req.body;

    if (!code || !type || value === undefined) {
      return res.status(400).json({
        message: "Code, type and value are required",
      });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.trim().toUpperCase(),
        type,
        value: Number(value),
        minimumOrder: Number(minimumOrder || 0),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        usageLimit: Number(usageLimit || 0),
        isActive: Boolean(isActive),
      },
    });

    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({
      message: error?.code === "P2002" ? "Coupon already exists" : "Failed to create coupon",
    });
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await prisma.coupon.update({
      where: { id: Number(id) },
      data: {
        code: req.body.code.trim().toUpperCase(),
        type: req.body.type,
        value: Number(req.body.value),
        minimumOrder: Number(req.body.minimumOrder || 0),
        expiryDate: req.body.expiryDate ? new Date(req.body.expiryDate) : null,
        usageLimit: Number(req.body.usageLimit || 0),
        isActive: Boolean(req.body.isActive),
      },
    });

    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: "Failed to update coupon" });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    await prisma.coupon.delete({
      where: { id: Number(req.params.id) },
    });

    res.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete coupon" });
  }
};

exports.applyCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!coupon) {
      return res.status(404).json({ message: "Invalid coupon code" });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ message: "Coupon is disabled" });
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ message: "Coupon has expired" });
    }

    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: "Coupon usage limit reached" });
    }

    if (Number(subtotal) < Number(coupon.minimumOrder)) {
      return res.status(400).json({
        message: `Minimum order should be Rs ${coupon.minimumOrder}`,
      });
    }

    let discountAmount = 0;

    if (coupon.type === "PERCENTAGE") {
      discountAmount = Math.round((Number(subtotal) * Number(coupon.value)) / 100);
    } else {
      discountAmount = Number(coupon.value);
    }

    discountAmount = Math.min(discountAmount, Number(subtotal));

    res.json({
      success: true,
      coupon,
      discountAmount,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to apply coupon" });
  }
};