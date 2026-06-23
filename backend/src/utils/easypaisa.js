const crypto = require("crypto");

function generateEasypaisaHash(params, hashKey) {
  const sortedKeys = Object.keys(params).sort();
  const sortedString = sortedKeys.map((key) => `${key}=${params[key]}`).join("&");

  return crypto
    .createHmac("sha256", hashKey)
    .update(sortedString)
    .digest("hex")
    .toUpperCase();
}

function buildEasypaisaParams(amount, trackingId) {
  const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const expireDateStr =
    expiryDate.getFullYear() +
    String(expiryDate.getMonth() + 1).padStart(2, "0") +
    String(expiryDate.getDate()).padStart(2, "0") +
    String(expiryDate.getHours()).padStart(2, "0") +
    String(expiryDate.getMinutes()).padStart(2, "0") +
    String(expiryDate.getSeconds()).padStart(2, "0");

  const params = {
    storeId: process.env.EASYPAISA_STORE_ID,
    amount: amount.toFixed(2),
    postBackURL: process.env.PAYMENT_RETURN_URL,
    orderRefNum: trackingId + Date.now(),
    expiryDate: expireDateStr,
    merchantHashedReq: "",
    autoRedirect: "1",
    paymentMethod: "InitialRequest",
  };

  params.merchantHashedReq = generateEasypaisaHash(
    params,
    process.env.EASYPAISA_HASH_KEY
  );

  return params;
}

module.exports = { buildEasypaisaParams };