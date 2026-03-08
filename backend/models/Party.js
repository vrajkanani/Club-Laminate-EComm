const mongoose = require("mongoose");
const { PARTY_TYPES } = require("../utils/constants");

const PartySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Party name is required"],
      trim: true,
      index: true,
    },
    contactPerson: {
      type: String,
      trim: true,
    },
    partyType: {
      type: String,
      enum: Object.values(PARTY_TYPES),
      required: [true, "Party type is required"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true, // Allows multiple null values but enforces uniqueness for non-null
      unique: true,
    },
    gst: {
      type: String,
      trim: true,
      uppercase: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    metadata: {
      creditLimit: Number,
      paymentTerms: String,
    },
  },
  { timestamps: true },
);

// Index for searching
PartySchema.index({ name: "text" });
PartySchema.index({ partyType: 1, isActive: 1 });

module.exports = mongoose.model("Party", PartySchema, "parties");
