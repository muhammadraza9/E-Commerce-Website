const prisma = require("../config/db");
const createActivityLog = require("../utils/createActivityLog");

const DEFAULT_SETTINGS = {
  id: 1,
  storeName: "Style Avenue",
  storeEmail: "support@styleavenue.pk",
  phoneNumber: "+92 312 6779452",
  currency: "PKR",
  shippingFee: 500,
  freeShippingLimit: 50000,
  storeAddress: "Style Avenue, Main Market, Rawalpindi, Punjab, Pakistan",
  storeLogoUrl: "",
  whatsappNumber: "+92 312 6779452",
  instagramUrl: "",
  facebookUrl: "",
  supportHours: "Monday - Saturday: 10:00 AM - 9:00 PM",
  taxPercentage: 0,
  codEnabled: true,
  freeShippingEnabled: true,
  orderPrefix: "SA",
  lowStockAlertLimit: 5,
  maintenanceMode: false,
};

const buildSettingsData = (body) => ({
  storeName: body.storeName.trim(),
  storeEmail: body.storeEmail.trim().toLowerCase(),
  phoneNumber: body.phoneNumber.trim(),
  currency: body.currency.trim().toUpperCase(),
  shippingFee: Math.max(Number(body.shippingFee || 0), 0),
  freeShippingLimit: Math.max(Number(body.freeShippingLimit || 0), 0),
  storeAddress: body.storeAddress?.trim() || "",
  storeLogoUrl: body.storeLogoUrl?.trim() || "",
  whatsappNumber: body.whatsappNumber?.trim() || "",
  instagramUrl: body.instagramUrl?.trim() || "",
  facebookUrl: body.facebookUrl?.trim() || "",
  supportHours: body.supportHours?.trim() || "",
  taxPercentage: Math.max(Number(body.taxPercentage || 0), 0),
  codEnabled: Boolean(body.codEnabled),
  freeShippingEnabled: Boolean(body.freeShippingEnabled),
  orderPrefix: body.orderPrefix?.trim().toUpperCase() || "SA",
  lowStockAlertLimit: Math.max(Number(body.lowStockAlertLimit || 5), 0),
  maintenanceMode: Boolean(body.maintenanceMode),
});

exports.getAdminSettings = async (req, res) => {
  try {
    const settings = await prisma.adminsetting.upsert({
      where: { id: 1 },
      update: {},
      create: DEFAULT_SETTINGS,
    });

    res.json(settings);
  } catch (error) {
    console.error("Get admin settings error:", error.message);

    res.status(500).json({
      message: "Failed to load admin settings",
      error: error.message,
    });
  }
};

exports.updateAdminSettings = async (req, res) => {
  try {
    const { storeName, storeEmail, phoneNumber, currency } = req.body;

    if (
      !storeName?.trim() ||
      !storeEmail?.trim() ||
      !phoneNumber?.trim() ||
      !currency?.trim()
    ) {
      return res.status(400).json({
        message: "Store name, email, phone and currency are required",
      });
    }

    const data = buildSettingsData(req.body);

    const settings = await prisma.adminsetting.upsert({
      where: { id: 1 },
      update: data,
      create: {
        id: 1,
        ...data,
      },
    });

    await createActivityLog({
      adminId: req.user?.id,
      adminEmail: req.user?.email,
      action: "UPDATE",
      entity: "ADMIN_SETTINGS",
      entityId: settings.id,
      message: `Updated store settings for "${settings.storeName}"`,
    });

    res.json({
      message: "Admin settings updated successfully",
      settings,
    });
  } catch (error) {
    console.error("Update admin settings error:", error.message);

    res.status(500).json({
      message: "Failed to update admin settings",
      error: error.message,
    });
  }
};