const prisma = require("../config/db");
const { buildJazzCashParams } = require("../utils/jazzcash");
const { buildEasypaisaParams } = require("../utils/easypaisa");

exports.initiatePayment = async (req, res) => {
  try {
    const { orderId, provider } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    let formUrl;
    let params;

    if (provider === "JAZZCASH") {
      params = buildJazzCashParams(order.id, order.total, order.trackingId);
      formUrl = process.env.JAZZCASH_SANDBOX_URL;
    } else if (provider === "EASYPAISA") {
      params = buildEasypaisaParams(order.total, order.trackingId);
      formUrl = process.env.EASYPAISA_SANDBOX_URL;
    } else {
      return res.status(400).json({ message: "Invalid payment provider" });
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        txnRefNo: params.pp_TxnRefNo || params.orderRefNum,
      },
    });

    res.json({ formUrl, params });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Payment initiation failed" });
  }
};

exports.paymentCallback = async (req, res) => {
  try {
    const data = req.body;

    // JazzCash response check
    if (data.pp_ResponseCode) {
      const order = await prisma.order.findFirst({
        where: { txnRefNo: data.pp_TxnRefNo },
      });

      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: data.pp_ResponseCode === "000" ? "Paid" : "Failed",
          },
        });
      }

      return res.redirect(
        data.pp_ResponseCode === "000"
          ? `${process.env.FRONTEND_URL}/payment/success`
          : `${process.env.FRONTEND_URL}/payment/failed`
      );
    }

    // Easypaisa response check
    if (data.orderRefNum) {
      const order = await prisma.order.findFirst({
        where: { txnRefNo: data.orderRefNum },
      });

      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: data.status === "0000" ? "Paid" : "Failed",
          },
        });
      }

      return res.redirect(
        data.status === "0000"
          ? `${process.env.FRONTEND_URL}/payment/success`
          : `${process.env.FRONTEND_URL}/payment/failed`
      );
    }

    res.redirect(`${process.env.FRONTEND_URL}/payment/failed`);
  } catch (error) {
    console.log(error);
    res.redirect(`${process.env.FRONTEND_URL}/payment/failed`);
  }
};