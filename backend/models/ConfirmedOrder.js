const mongoose = require("mongoose");

const ConfirmedOrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    mobileNo: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
    },
    orderDate: {
      type: Date,
    },
    confirmationDate: {
      type: Date,
      default: Date.now,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      default: "confirmed",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model(
  "ConfirmedOrder",
  ConfirmedOrderSchema,
  "confirmed_orders",
);
