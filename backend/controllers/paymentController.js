const Payment = require("../models/Payment");
const { PAYMENT_STATUS } = require("../utils/constants");

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private (Admin)
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("partyId", "name")
      .populate("userId", "fullName")
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Create a payment
// @route   POST /api/payments
// @access  Private (Admin)
exports.createPayment = async (req, res) => {
  try {
    const {
      partyId,
      amount,
      paymentDate,
      paymentMode,
      transactionRef,
      type,
      notes,
    } = req.body;
    const payment = new Payment({
      partyId,
      amount,
      paymentDate,
      paymentMode,
      transactionRef,
      type,
      notes,
      orderType: type === "Inward" ? "SalesOrder" : "PurchaseOrder",
      status: PAYMENT_STATUS.COMPLETED,
    });
    const savedPayment = await payment.save();
    const populated = await Payment.findById(savedPayment._id).populate(
      "partyId",
      "name",
    );
    res.status(201).json(populated);
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
