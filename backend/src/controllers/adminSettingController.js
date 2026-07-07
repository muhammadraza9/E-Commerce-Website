const prisma = require("../config/db");

const DEFAULT_SETTINGS = {
  id: 1,
  storeName: "Style Avenue",
  storeEmail: "support@styleavenue.pk",
  phoneNumber: "+92 312 6779452",
  currency: "PKR",
  shippingFee: 500,
  freeShippingLimit: 50000,
  storeAddress: "Style Avenue, Main Market, Rawalpindi, Punjab, Pakistan",
};

exports.getAdminSettings = async (req, res) => {
  try {
    let settings = await prisma.adminsetting.findUnique({
      where: { id: 1 },
    });

    if (!settings) {
      settings = await prisma.adminsetting.create({
        data: DEFAULT_SETTINGS,
      });
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load admin settings",
      error: error.message,
    });
  }
};

exports.updateAdminSettings = async (req, res) => {
  try {
    const {
      storeName,
      storeEmail,
      phoneNumber,
      currency,
      shippingFee,
      freeShippingLimit,
      storeAddress,
    } = req.body;

    if (!storeName || !storeEmail || !phoneNumber || !currency) {
      return res.status(400).json({
        message: "Store name, email, phone and currency are required",
      });
    }

    const settings = await prisma.adminsetting.upsert({
      where: { id: 1 },
      update: {
        storeName,
        storeEmail,
        phoneNumber,
        currency,
        shippingFee: Number(shippingFee || 0),
        freeShippingLimit: Number(freeShippingLimit || 0),
        storeAddress,
      },
      create: {
        id: 1,
        storeName,
        storeEmail,
        phoneNumber,
        currency,
        shippingFee: Number(shippingFee || 0),
        freeShippingLimit: Number(freeShippingLimit || 0),
        storeAddress,
      },
    });

    res.json({
      message: "Admin settings updated successfully",
      settings,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update admin settings",
      error: error.message,
    });
  }
};