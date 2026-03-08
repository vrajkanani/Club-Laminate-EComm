const mongoose = require("mongoose");
const slugify = require("slugify");

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot be more than 500 characters"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    showInHeader: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// Generate slug from name before saving
CategorySchema.pre("save", function (next) {
  if (!this.isModified("name")) {
    return next();
  }
  this.slug = slugify(this.name, { lower: true, strict: true });
  next();
});

module.exports = mongoose.model("Category", CategorySchema);
