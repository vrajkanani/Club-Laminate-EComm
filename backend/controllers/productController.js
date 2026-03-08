const Product = require("../models/Product");
const Category = require("../models/Category");
const fs = require("fs");
const path = require("path");

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getAllProducts = async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};

    if (category) {
      // Find category by slug
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        query.categories = categoryDoc._id;
      } else {
        return res.json([]); // Return empty if category slug is invalid
      }
    }

    const products = await Product.find(query)
      .populate("categories", "name slug")
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "categories",
      "name slug",
    );
    if (product) res.json(product);
    else res.status(404).json({ message: "Product not found" });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private (Admin)
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, categories, stock, sku, reorderLevel } =
      req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Please upload an image" });
    }

    // categories should be an array of IDs from frontend
    const categoryIds = Array.isArray(categories)
      ? categories
      : JSON.parse(categories || "[]");

    const product = new Product({
      name,
      description,
      price,
      categories: categoryIds,
      stock,
      stockQuantity: stock, // Explicitly set stockQuantity as well
      sku,
      reorderLevel,
      image: req.file.path,
    });

    const savedProduct = await product.save();
    const populatedProduct = await Product.findById(savedProduct._id).populate(
      "categories",
      "name slug",
    );
    res.status(201).json(populatedProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "SKU must be unique" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Admin)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: "Product not found" });
    }

    const { name, description, price, categories, stock, sku, reorderLevel } =
      req.body;

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.stock = stock !== undefined ? stock : product.stock;
    product.sku = sku !== undefined ? sku : product.sku;
    product.reorderLevel =
      reorderLevel !== undefined ? reorderLevel : product.reorderLevel;

    if (categories) {
      const categoryIds = Array.isArray(categories)
        ? categories
        : JSON.parse(categories);
      product.categories = categoryIds;
    }

    if (req.file) {
      if (fs.existsSync(product.image)) fs.unlinkSync(product.image);
      product.image = req.file.path;
    }

    const updatedProduct = await product.save();
    const populatedProduct = await Product.findById(
      updatedProduct._id,
    ).populate("categories", "name slug");
    res.json(populatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "SKU must be unique" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Admin)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (fs.existsSync(product.image)) fs.unlinkSync(product.image);

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product and associated image deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
