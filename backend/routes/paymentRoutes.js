const express = require("express");
const router = express.Router();
const {
  getAllPayments,
  createPayment,
} = require("../controllers/paymentController");

router.route("/payments").get(getAllPayments).post(createPayment);

module.exports = router;
