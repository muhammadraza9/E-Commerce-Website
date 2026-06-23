const express = require("express");
const router = express.Router();
const { initiatePayment, paymentCallback } = require("../controllers/paymentController");

router.post("/initiate", initiatePayment);
router.post("/callback", paymentCallback);

module.exports = router;