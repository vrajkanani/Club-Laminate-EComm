const Category = require("../models/Category");
const Product = require("../models/Product");

// @desc    Get all active categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({
      name: 1,
    });

    // Add product count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({
          categories: category._id,
        });
        return {
          ...category._doc,
          productCount,
        };
      }),
    );

    res.json(categoriesWithCount);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// @desc    Get category by slug
// @route   GET /api/categories/:slug
// @access  Public
exports.getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({
      slug: req.params.slug,
      isActive: true,
    });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const productCount = await Product.countDocuments({
      categories: category._id,
    });

    res.json({
      ...category._doc,
      productCount,
    });
  } catch (error) {
    console.error("Error fetching category by slug:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Get all categories (for admin)
// @route   GET /api/categories/admin
// @access  Private (Admin)
exports.getAdminCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });

    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({
          categories: category._id,
        });
        return {
          ...category._doc,
          productCount,
        };
      }),
    );

    res.json(categoriesWithCount);
  } catch (error) {
    console.error("Error fetching admin categories:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private (Admin)
exports.createCategory = async (req, res) => {
  try {
    const { name, description, showInHeader } = req.body;

    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = await Category.create({
      name,
      description,
      showInHeader: showInHeader !== undefined ? showInHeader : true,
    });
    res.status(201).json(category);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private (Admin)
exports.updateCategory = async (req, res) => {
  try {
    const { name, description, isActive, showInHeader } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    category.name = name || category.name;
    category.description = description || category.description;
    if (isActive !== undefined) category.isActive = isActive;
    if (showInHeader !== undefined) category.showInHeader = showInHeader;

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Soft delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if any product is using this category
    const productCount = await Product.countDocuments({
      categories: req.params.id,
    });
    if (productCount > 0) {
      // If products exist, just deactivate it
      category.isActive = false;
      await category.save();
      return res.json({
        message: "Category deactivated as it is linked to products",
      });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
