const mongoose = require("mongoose");
const { ORDER_STATUS, PAYMENT_STATUS } = require("../utils/constants");
const { generateOrderNumber } = require("../utils/transactionHelper");

const SalesOrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Can be User or Party
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        productName: {
          type: String,
          required: true, // Snapshot for historical data
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
        },
        unitPrice: {
          type: Number,
          required: true,
          min: [0, "Unit price cannot be negative"],
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
    shippingAddress: {
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
      street: {
        type: String,
        required: true,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
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
    },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    confirmedDate: {
      type: Date,
    },
    deliveredDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
    confirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

// Auto-generate order number before saving
SalesOrderSchema.pre("save", function (next) {
  if (!this.orderNumber) {
    this.orderNumber = generateOrderNumber("SO");
  }
  next();
});

// Calculate subtotals and total before validation
SalesOrderSchema.pre("validate", function (next) {
  if (this.items && this.items.length > 0) {
    this.items.forEach((item) => {
      item.subtotal = item.quantity * item.unitPrice;
    });
    this.totalAmount = this.items.reduce((sum, item) => sum + item.subtotal, 0);
  }
  next();
});

// Indexes
SalesOrderSchema.index({ orderNumber: 1 });
SalesOrderSchema.index({ customerId: 1, orderDate: -1 });
SalesOrderSchema.index({ status: 1, paymentStatus: 1 });
SalesOrderSchema.index({ orderDate: -1 });

module.exports = mongoose.model("SalesOrder", SalesOrderSchema, "sales_orders");
