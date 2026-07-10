const prisma = require("../config/db");
const createActivityLog = require("../utils/createActivityLog");

const VALID_TYPES = ["PERCENTAGE", "FIXED"];

const createLog = (req, data) =>
  createActivityLog({
    adminId: req.user?.id,
    adminEmail: req.user?.email,
    ...data,
  });

const parseCouponData = (body) => ({
  code: body.code?.trim().toUpperCase(),
  type: body.type,
  value: Number(body.value),
  minimumOrder: Number(body.minimumOrder || 0),
  expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
  usageLimit: Number(body.usageLimit || 0),
  isActive: Boolean(body.isActive),
});

exports.getCoupons = async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json(coupons);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load coupons",
    });
  }
};

exports.createCoupon = async (req, res) => {
  try {
    const data = parseCouponData(req.body);

    if (
      !data.code ||
      !VALID_TYPES.includes(data.type) ||
      !Number.isFinite(data.value) ||
      data.value <= 0
    ) {
      return res.status(400).json({
        message: "Valid code, type and value are required",
      });
    }

    const coupon = await prisma.coupon.create({ data });

    await createLog(req, {
      action: "CREATE",
      entity: "COUPON",
      entityId: coupon.id,
      message: `Created coupon "${coupon.code}"`,
    });

    res.status(201).json(coupon);
  } catch (error) {
    res.status(error?.code === "P2002" ? 400 : 500).json({
      message:
        error?.code === "P2002"
          ? "Coupon already exists"
          : "Failed to create coupon",
    });
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const data = parseCouponData(req.body);

    if (
      !id ||
      !data.code ||
      !VALID_TYPES.includes(data.type) ||
      !Number.isFinite(data.value) ||
      data.value <= 0
    ) {
      return res.status(400).json({
        message: "Invalid coupon data",
      });
    }

    const existing = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        message: "Coupon not found",
      });
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data,
    });

    await createLog(req, {
      action: "UPDATE",
      entity: "COUPON",
      entityId: coupon.id,
      message: `Updated coupon "${coupon.code}"`,
    });

    res.json(coupon);
  } catch (error) {
    res.status(error?.code === "P2002" ? 400 : 500).json({
      message:
        error?.code === "P2002"
          ? "Coupon code already exists"
          : "Failed to update coupon",
    });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        message: "Invalid coupon ID",
      });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      return res.status(404).json({
        message: "Coupon not found",
      });
    }

    await prisma.coupon.delete({
      where: { id },
    });

    await createLog(req, {
      action: "DELETE",
      entity: "COUPON",
      entityId: coupon.id,
      message: `Deleted coupon "${coupon.code}"`,
    });

    res.json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete coupon",
    });
  }
};

exports.applyCoupon = async (req, res) => {
  try {
    const code = req.body.code?.trim().toUpperCase();
    const subtotal = Number(req.body.subtotal || 0);

    if (!code || subtotal <= 0) {
      return res.status(400).json({
        message: "Coupon code and valid subtotal are required",
      });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon) {
      return res.status(404).json({
        message: "Invalid coupon code",
      });
    }

    if (!coupon.isActive) {
      return res.status(400).json({
        message: "Coupon is disabled",
      });
    }

    if (coupon.expiryDate && coupon.expiryDate < new Date()) {
      return res.status(400).json({
        message: "Coupon has expired",
      });
    }

    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        message: "Coupon usage limit reached",
      });
    }

    if (subtotal < coupon.minimumOrder) {
      return res.status(400).json({
        message: `Minimum order should be Rs ${coupon.minimumOrder}`,
      });
    }

    const rawDiscount =
      coupon.type === "PERCENTAGE"
        ? (subtotal * coupon.value) / 100
        : coupon.value;

    res.json({
      success: true,
      coupon,
      discountAmount: Math.min(Math.round(rawDiscount), subtotal),
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to apply coupon",
    });
  }
};