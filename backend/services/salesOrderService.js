const SalesOrder = require("../models/SalesOrder");
const Product = require("../models/Product");
const Payment = require("../models/Payment");
const { withTransaction } = require("../utils/transactionHelper");
const {
  checkStockAvailability,
  decreaseStock,
  increaseStock,
} = require("./stockService");
const { createAuditLog } = require("./auditService");
const {
  AUDIT_ACTIONS,
  ENTITY_TYPES,
  ORDER_STATUS,
  PAYMENT_STATUS,
  PAYMENT_MODES,
} = require("../utils/constants");

/**
 * Create a new sales order with stock validation
 * @param {Object} orderData - Order data
 * @param {ObjectId} customerId - Customer ID
 * @returns {Promise<Object>} Created order and payment
 */
const createSalesOrder = async (orderData, customerId = null) => {
  return await withTransaction(async (session) => {
    // Validate stock for all items
    for (const item of orderData.items) {
      const { available, availableStock } = await checkStockAvailability(
        item.productId,
        item.quantity,
      );

      if (!available) {
        throw new Error(
          `Insufficient stock for product. Available: ${availableStock}, Required: ${item.quantity}`,
        );
      }
    }

    // Fetch product details and create order items with snapshots
    const orderItems = await Promise.all(
      orderData.items.map(async (item) => {
        const product = await Product.findById(item.productId);
        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        return {
          productId: product._id,
          productName: product.name,
          quantity: item.quantity,
          unitPrice: product.price,
          subtotal: item.quantity * product.price,
        };
      }),
    );

    // Create sales order
    const salesOrder = new SalesOrder({
      customerId,
      items: orderItems,
      shippingAddress: orderData.shippingAddress,
      notes: orderData.notes,
    });

    await salesOrder.save({ session });

    // Decrease stock for each item
    for (const item of salesOrder.items) {
      await decreaseStock(item.productId, item.quantity, null, session);
    }

    // Create payment record
    const payment = new Payment({
      orderId: salesOrder._id,
      orderType: "SalesOrder",
      amount: salesOrder.totalAmount,
      paymentMode: PAYMENT_MODES.CASH, // Default, can be updated later
      status: PAYMENT_STATUS.PENDING,
    });

    await payment.save({ session });

    return { salesOrder, payment };
  });
};

/**
 * Confirm a sales order
 * @param {ObjectId} orderId - Order ID
 * @param {ObjectId} adminId - Admin user ID
 * @param {Object} req - Express request object
 * @returns {Promise<SalesOrder>}
 */
const confirmSalesOrder = async (orderId, adminId, req = null) => {
  const order = await SalesOrder.findById(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.status !== ORDER_STATUS.PENDING) {
    throw new Error(`Cannot confirm order with status: ${order.status}`);
  }

  order.status = ORDER_STATUS.CONFIRMED;
  order.confirmedDate = new Date();
  order.confirmedBy = adminId;

  await order.save();

  // Create audit log
  await createAuditLog({
    adminId,
    action: AUDIT_ACTIONS.SALES_ORDER_CONFIRMED,
    entityType: ENTITY_TYPES.SALES_ORDER,
    entityId: orderId,
    changes: {
      status: ORDER_STATUS.CONFIRMED,
      confirmedDate: order.confirmedDate,
    },
    req,
  });

  return order;
};

/**
 * Cancel a sales order and restore stock
 * @param {ObjectId} orderId - Order ID
 * @param {ObjectId} adminId - Admin user ID
 * @param {Object} req - Express request object
 * @returns {Promise<SalesOrder>}
 */
const cancelSalesOrder = async (orderId, adminId, req = null) => {
  return await withTransaction(async (session) => {
    const order = await SalesOrder.findById(orderId).session(session);

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status === ORDER_STATUS.CANCELLED) {
      throw new Error("Order is already cancelled");
    }

    if (order.status === ORDER_STATUS.DELIVERED) {
      throw new Error("Cannot cancel delivered order");
    }

    // Restore stock for each item
    for (const item of order.items) {
      await increaseStock(item.productId, item.quantity, adminId, session);
    }

    order.status = ORDER_STATUS.CANCELLED;
    await order.save({ session });

    // Update payment status if exists
    await Payment.updateMany(
      { orderId: order._id, orderType: "SalesOrder" },
      { status: PAYMENT_STATUS.REFUNDED },
      { session },
    );

    // Create audit log
    await createAuditLog({
      adminId,
      action: AUDIT_ACTIONS.SALES_ORDER_CANCELLED,
      entityType: ENTITY_TYPES.SALES_ORDER,
      entityId: orderId,
      changes: {
        status: ORDER_STATUS.CANCELLED,
      },
      req,
    });

    return order;
  });
};

/**
 * Update order status
 * @param {ObjectId} orderId - Order ID
 * @param {string} newStatus - New status
 * @param {ObjectId} adminId - Admin user ID
 * @param {Object} req - Express request object
 * @returns {Promise<SalesOrder>}
 */
const updateOrderStatus = async (orderId, newStatus, adminId, req = null) => {
  const order = await SalesOrder.findById(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  const oldStatus = order.status;
  order.status = newStatus;

  if (newStatus === ORDER_STATUS.DELIVERED) {
    order.deliveredDate = new Date();
  }

  await order.save();

  // Determine audit action based on new status
  let auditAction = AUDIT_ACTIONS.SALES_ORDER_CONFIRMED;
  if (newStatus === ORDER_STATUS.SHIPPED) {
    auditAction = AUDIT_ACTIONS.SALES_ORDER_SHIPPED;
  } else if (newStatus === ORDER_STATUS.DELIVERED) {
    auditAction = AUDIT_ACTIONS.SALES_ORDER_DELIVERED;
  }

  // Create audit log
  await createAuditLog({
    adminId,
    action: auditAction,
    entityType: ENTITY_TYPES.SALES_ORDER,
    entityId: orderId,
    changes: {
      oldStatus,
      newStatus,
    },
    req,
  });

  return order;
};

/**
 * Get sales orders with filters and pagination
 * @param {Object} filters - Filter options
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<Object>}
 */
const getSalesOrders = async (filters = {}, page = 1, limit = 20) => {
  const query = {};

  if (filters.customerId) query.customerId = filters.customerId;
  if (filters.status) query.status = filters.status;
  if (filters.paymentStatus) query.paymentStatus = filters.paymentStatus;
  if (filters.startDate || filters.endDate) {
    query.orderDate = {};
    if (filters.startDate) query.orderDate.$gte = new Date(filters.startDate);
    if (filters.endDate) query.orderDate.$lte = new Date(filters.endDate);
  }

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    SalesOrder.find(query)
      .populate("customerId", "fullName email")
      .populate("items.productId", "name image")
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit),
    SalesOrder.countDocuments(query),
  ]);

  return {
    orders,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

module.exports = {
  createSalesOrder,
  confirmSalesOrder,
  cancelSalesOrder,
  updateOrderStatus,
  getSalesOrders,
};
