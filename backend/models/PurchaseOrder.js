const mongoose = require("mongoose");
const { PURCHASE_ORDER_STATUS } = require("../utils/constants");
const { generateOrderNumber } = require("../utils/transactionHelper");

const PurchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: {
      type: String,
      unique: true,
      index: true,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Party",
      required: [true, "Supplier is required"],
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
        },
        purchasePrice: {
          type: Number,
          required: true,
          min: [0, "Purchase price cannot be negative"],
        },
        subtotal: {
          type: Number,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(PURCHASE_ORDER_STATUS),
      default: PURCHASE_ORDER_STATUS.DRAFT,
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    expectedDeliveryDate: {
      type: Date,
    },
    receivedDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

// Auto-generate PO number before saving
PurchaseOrderSchema.pre("save", function (next) {
  if (!this.poNumber) {
    this.poNumber = generateOrderNumber("PO");
  }
  next();
});

// Calculate subtotals and total before validation
PurchaseOrderSchema.pre("validate", function (next) {
  if (this.items && this.items.length > 0) {
    this.items.forEach((item) => {
      item.subtotal = item.quantity * item.purchasePrice;
    });
    this.totalAmount = this.items.reduce((sum, item) => sum + item.subtotal, 0);
  }
  next();
});

// Indexes
PurchaseOrderSchema.index({ supplierId: 1, orderDate: -1 });
PurchaseOrderSchema.index({ status: 1 });

module.exports = mongoose.model(
  "PurchaseOrder",
  PurchaseOrderSchema,
  "purchase_orders",
);
