const stockService = require("../services/stockService");

// @desc    Get products with low stock
// @route   GET /api/stock/low-stock
// @access  Private (Admin)
exports.getLowStock = async (req, res) => {
  try {
    const products = await stockService.getLowStockProducts();
    res.json(products);
  } catch (error) {
    console.error("Error fetching low stock products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Get all products with stock info
// @route   GET /api/stock
// @access  Private (Admin)
exports.getStockList = async (req, res) => {
  try {
    const { categoryId, lowStock, page, limit } = req.query;
    const result = await stockService.getStockList(
      { categoryId, lowStock: lowStock === "true" },
      parseInt(page) || 1,
      parseInt(limit) || 20,
    );
    res.json(result);
  } catch (error) {
    console.error("Error fetching stock list:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Adjust stock manually
// @route   POST /api/stock/:id/adjust
// @access  Private (Admin)
exports.adjustStock = async (req, res) => {
  try {
    const { newQuantity, reason } = req.body;
    const product = await stockService.adjustStock(
      req.params.id,
      newQuantity,
      req.user.id,
      reason,
    );
    res.json(product);
  } catch (error) {
    console.error("Error adjusting stock:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};
