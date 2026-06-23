const crypto = require("crypto");

function generateJazzCashHash(params, salt) {
  const sortedKeys = Object.keys(params).sort();
  const sortedString = sortedKeys.map((key) => params[key]).join("&");
  const hashString = salt + "&" + sortedString;

  return crypto
    .createHmac("sha256", salt)
    .update(hashString)
    .digest("hex")
    .toUpperCase();
}

function buildJazzCashParams(orderId, amount, trackingId) {
  const txnDateTime = new Date()
    .toISOString()
    .replace(/[-T:.Z]/g, "")
    .slice(0, 14);

  const expiryDateTime = new Date(Date.now() + 60 * 60 * 1000)
    .toISOString()
    .replace(/[-T:.Z]/g, "")
    .slice(0, 14);

  const params = {
    pp_Version: "1.1",
    pp_TxnType: "MWALLET",
    pp_Language: "EN",
    pp_MerchantID: process.env.JAZZCASH_MERCHANT_ID,
    pp_Password: process.env.JAZZCASH_PASSWORD,
    pp_TxnRefNo: "T" + trackingId + Date.now(),
    pp_Amount: (amount * 100).toString(),
    pp_TxnCurrency: "PKR",
    pp_TxnDateTime: txnDateTime,
    pp_BillReference: trackingId,
    pp_Description: "Order Payment",
    pp_TxnExpiryDateTime: expiryDateTime,
    pp_ReturnURL: process.env.PAYMENT_RETURN_URL,
    ppmpf_1: "1",
    ppmpf_2: "2",
    ppmpf_3: "3",
    ppmpf_4: "4",
    ppmpf_5: "5",
  };

  params.pp_SecureHash = generateJazzCashHash(
    params,
    process.env.JAZZCASH_INTEGRITY_SALT
  );

  return params;
}

module.exports = { buildJazzCashParams, generateJazzCashHash };