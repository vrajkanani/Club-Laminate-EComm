const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
    ],
    image: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      default: 0,
    },
    // NEW STOCK MANAGEMENT FIELDS
    stockQuantity: {
      type: Number,
      default: 0,
      min: [0, "Stock quantity cannot be negative"],
    },
    reservedStock: {
      type: Number,
      default: 0,
      min: [0, "Reserved stock cannot be negative"],
    },
    reorderLevel: {
      type: Number,
      default: 10,
    },
    costPrice: {
      type: Number,
      min: [0, "Cost price cannot be negative"],
    },
    sku: {
      type: String,
      unique: true,
      sparse: true, // Allows null values
      trim: true,
      uppercase: true,
    },
  },
  { timestamps: true },
);

// Synchronize stock and stockQuantity fields
ProductSchema.pre("save", function (next) {
  if (this.isModified("stockQuantity")) {
    this.stock = this.stockQuantity;
  } else if (this.isModified("stock")) {
    this.stockQuantity = this.stock;
  }
  next();
});

module.exports = mongoose.model("Product", ProductSchema, "products");
