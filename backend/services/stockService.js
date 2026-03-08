const Product = require("../models/Product");
const { withTransaction } = require("../utils/transactionHelper");
const { createAuditLog } = require("./auditService");
const { AUDIT_ACTIONS, ENTITY_TYPES } = require("../utils/constants");

/**
 * Check if product has sufficient stock
 * @param {ObjectId} productId - Product ID
 * @param {number} quantity - Required quantity
 * @returns {Promise<Object>} { available: boolean, product: Product }
 */
const checkStockAvailability = async (productId, quantity) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new Error("Product not found");
  }

  const availableStock = product.stockQuantity || product.stock || 0;
  const available = availableStock >= quantity;

  return {
    available,
    product,
    availableStock,
  };
};

/**
 * Decrease stock when order is placed
 * @param {ObjectId} productId - Product ID
 * @param {number} quantity - Quantity to decrease
 * @param {ObjectId} adminId - Admin user ID (for audit)
 * @param {Object} session - MongoDB session for transaction
 * @returns {Promise<Product>}
 */
const decreaseStock = async (
  productId,
  quantity,
  adminId = null,
  session = null,
) => {
  const product = await Product.findById(productId).session(session);

  if (!product) {
    throw new Error("Product not found");
  }

  const currentStock = product.stockQuantity || product.stock || 0;

  if (currentStock < quantity) {
    throw new Error(
      `Insufficient stock for ${product.name}. Available: ${currentStock}, Required: ${quantity}`,
    );
  }

  // Update stockQuantity (or stock if stockQuantity doesn't exist yet)
  if (product.stockQuantity !== undefined) {
    product.stockQuantity -= quantity;
  } else {
    product.stock -= quantity;
  }

  await product.save({ session });

  // Create audit log if adminId provided
  if (adminId) {
    await createAuditLog({
      adminId,
      action: AUDIT_ACTIONS.STOCK_DECREASED,
      entityType: ENTITY_TYPES.PRODUCT,
      entityId: productId,
      changes: {
        quantity: -quantity,
        previousStock: currentStock,
        newStock: currentStock - quantity,
      },
    });
  }

  return product;
};

/**
 * Increase stock when purchase order is received
 * @param {ObjectId} productId - Product ID
 * @param {number} quantity - Quantity to increase
 * @param {ObjectId} adminId - Admin user ID (for audit)
 * @param {Object} session - MongoDB session for transaction
 * @returns {Promise<Product>}
 */
const increaseStock = async (productId, quantity, adminId, session = null) => {
  const product = await Product.findById(productId).session(session);

  if (!product) {
    throw new Error("Product not found");
  }

  const currentStock = product.stockQuantity || product.stock || 0;

  // Update stockQuantity (or stock if stockQuantity doesn't exist yet)
  if (product.stockQuantity !== undefined) {
    product.stockQuantity += quantity;
  } else {
    product.stock += quantity;
  }

  await product.save({ session });

  // Create audit log
  await createAuditLog({
    adminId,
    action: AUDIT_ACTIONS.STOCK_INCREASED,
    entityType: ENTITY_TYPES.PRODUCT,
    entityId: productId,
    changes: {
      quantity: +quantity,
      previousStock: currentStock,
      newStock: currentStock + quantity,
    },
  });

  return product;
};

/**
 * Manual stock adjustment
 * @param {ObjectId} productId - Product ID
 * @param {number} newQuantity - New stock quantity
 * @param {ObjectId} adminId - Admin user ID
 * @param {string} reason - Reason for adjustment
 * @returns {Promise<Product>}
 */
const adjustStock = async (productId, newQuantity, adminId, reason = "") => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new Error("Product not found");
  }

  const currentStock = product.stockQuantity || product.stock || 0;
  const difference = newQuantity - currentStock;

  if (product.stockQuantity !== undefined) {
    product.stockQuantity = newQuantity;
  } else {
    product.stock = newQuantity;
  }

  await product.save();

  // Create audit log
  await createAuditLog({
    adminId,
    action: AUDIT_ACTIONS.STOCK_ADJUSTED,
    entityType: ENTITY_TYPES.PRODUCT,
    entityId: productId,
    changes: {
      previousStock: currentStock,
      newStock: newQuantity,
      difference,
      reason,
    },
  });

  return product;
};

/**
 * Get products with low stock
 * @returns {Promise<Array>}
 */
const getLowStockProducts = async () => {
  const products = await Product.find({
    $expr: {
      $lt: [
        { $ifNull: ["$stockQuantity", "$stock"] },
        { $ifNull: ["$reorderLevel", 10] },
      ],
    },
  }).populate("categories");

  return products;
};

/**
 * Get all products with stock information
 * @param {Object} filters - Filter options
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<Object>}
 */
const getStockList = async (filters = {}, page = 1, limit = 20) => {
  const query = {};

  if (filters.categoryId) {
    query.categories = filters.categoryId;
  }

  if (filters.lowStock) {
    query.$expr = {
      $lt: [
        { $ifNull: ["$stockQuantity", "$stock"] },
        { $ifNull: ["$reorderLevel", 10] },
      ],
    };
  }

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate("categories")
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit),
    Product.countDocuments(query),
  ]);

  return {
    products,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

module.exports = {
  checkStockAvailability,
  decreaseStock,
  increaseStock,
  adjustStock,
  getLowStockProducts,
  getStockList,
};
