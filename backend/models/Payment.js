const mongoose = require("mongoose");
const { PAYMENT_STATUS, PAYMENT_MODES } = require("../utils/constants");
const { generateOrderNumber } = require("../utils/transactionHelper");

const PaymentSchema = new mongoose.Schema(
  {
    paymentNumber: {
      type: String,
      unique: true,
      index: true,
    },
    partyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Party",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "orderType",
    },
    orderType: {
      type: String,
      enum: ["SalesOrder", "PurchaseOrder", "Order"],
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Payment amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    paymentMode: {
      type: String,
      enum: Object.values(PAYMENT_MODES),
      required: [true, "Payment mode is required"],
    },
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
    type: {
      type: String,
      enum: ["Inward", "Outward"],
      default: "Inward",
    },
    transactionRef: {
      type: String,
      trim: true,
    },
    paidAt: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

// Auto-generate payment number before saving
PaymentSchema.pre("save", function (next) {
  if (!this.paymentNumber) {
    this.paymentNumber = generateOrderNumber("PAY");
  }

  // Set paidAt when status changes to completed
  if (this.status === PAYMENT_STATUS.COMPLETED && !this.paidAt) {
    this.paidAt = new Date();
  }

  next();
});

// Indexes
PaymentSchema.index({ orderId: 1, orderType: 1 });
PaymentSchema.index({ partyId: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Payment", PaymentSchema, "payments");
