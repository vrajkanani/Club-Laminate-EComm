const PurchaseOrder = require("../models/PurchaseOrder");
const { withTransaction } = require("../utils/transactionHelper");
const { increaseStock } = require("./stockService");
const { createAuditLog } = require("./auditService");
const {
  AUDIT_ACTIONS,
  ENTITY_TYPES,
  PURCHASE_ORDER_STATUS,
} = require("../utils/constants");

/**
 * Create a new purchase order
 * @param {Object} poData - Purchase order data
 * @param {ObjectId} adminId - Admin user ID
 * @param {Object} req - Express request object
 * @returns {Promise<PurchaseOrder>}
 */
const createPurchaseOrder = async (poData, adminId, req = null) => {
  const purchaseOrder = new PurchaseOrder({
    ...poData,
    createdBy: adminId,
  });

  await purchaseOrder.save();

  // Create audit log
  await createAuditLog({
    adminId,
    action: AUDIT_ACTIONS.PURCHASE_ORDER_CREATED,
    entityType: ENTITY_TYPES.PURCHASE_ORDER,
    entityId: purchaseOrder._id,
    changes: {
      poNumber: purchaseOrder.poNumber,
      totalAmount: purchaseOrder.totalAmount,
    },
    req,
  });

  return purchaseOrder;
};

/**
 * Approve a purchase order
 * @param {ObjectId} poId - Purchase order ID
 * @param {ObjectId} adminId - Admin user ID
 * @param {Object} req - Express request object
 * @returns {Promise<PurchaseOrder>}
 */
const approvePurchaseOrder = async (poId, adminId, req = null) => {
  const po = await PurchaseOrder.findById(poId);

  if (!po) {
    throw new Error("Purchase order not found");
  }

  if (
    po.status !== PURCHASE_ORDER_STATUS.DRAFT &&
    po.status !== PURCHASE_ORDER_STATUS.PENDING
  ) {
    throw new Error(`Cannot approve purchase order with status: ${po.status}`);
  }

  po.status = PURCHASE_ORDER_STATUS.APPROVED;
  po.approvedBy = adminId;

  await po.save();

  // Create audit log
  await createAuditLog({
    adminId,
    action: AUDIT_ACTIONS.PURCHASE_ORDER_APPROVED,
    entityType: ENTITY_TYPES.PURCHASE_ORDER,
    entityId: poId,
    changes: {
      status: PURCHASE_ORDER_STATUS.APPROVED,
    },
    req,
  });

  return po;
};

/**
 * Mark purchase order as received and increase stock
 * @param {ObjectId} poId - Purchase order ID
 * @param {ObjectId} adminId - Admin user ID
 * @param {Object} req - Express request object
 * @returns {Promise<PurchaseOrder>}
 */
const receivePurchaseOrder = async (poId, adminId, req = null) => {
  return await withTransaction(async (session) => {
    const po = await PurchaseOrder.findById(poId).session(session);

    if (!po) {
      throw new Error("Purchase order not found");
    }

    if (po.status !== PURCHASE_ORDER_STATUS.APPROVED) {
      throw new Error("Purchase order must be approved before receiving");
    }

    // Increase stock for each item
    for (const item of po.items) {
      await increaseStock(item.productId, item.quantity, adminId, session);
    }

    po.status = PURCHASE_ORDER_STATUS.RECEIVED;
    po.receivedDate = new Date();

    await po.save({ session });

    // Create audit log
    await createAuditLog({
      adminId,
      action: AUDIT_ACTIONS.PURCHASE_ORDER_RECEIVED,
      entityType: ENTITY_TYPES.PURCHASE_ORDER,
      entityId: poId,
      changes: {
        status: PURCHASE_ORDER_STATUS.RECEIVED,
        receivedDate: po.receivedDate,
      },
      req,
    });

    return po;
  });
};

/**
 * Cancel a purchase order
 * @param {ObjectId} poId - Purchase order ID
 * @param {ObjectId} adminId - Admin user ID
 * @param {Object} req - Express request object
 * @returns {Promise<PurchaseOrder>}
 */
const cancelPurchaseOrder = async (poId, adminId, req = null) => {
  const po = await PurchaseOrder.findById(poId);

  if (!po) {
    throw new Error("Purchase order not found");
  }

  if (po.status === PURCHASE_ORDER_STATUS.RECEIVED) {
    throw new Error("Cannot cancel received purchase order");
  }

  po.status = PURCHASE_ORDER_STATUS.CANCELLED;
  await po.save();

  // Create audit log
  await createAuditLog({
    adminId,
    action: AUDIT_ACTIONS.PURCHASE_ORDER_CANCELLED,
    entityType: ENTITY_TYPES.PURCHASE_ORDER,
    entityId: poId,
    changes: {
      status: PURCHASE_ORDER_STATUS.CANCELLED,
    },
    req,
  });

  return po;
};

/**
 * Get purchase orders with filters and pagination
 * @param {Object} filters - Filter options
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<Object>}
 */
const getPurchaseOrders = async (filters = {}, page = 1, limit = 20) => {
  const query = {};

  if (filters.supplierId) query.supplierId = filters.supplierId;
  if (filters.status) query.status = filters.status;
  if (filters.startDate || filters.endDate) {
    query.orderDate = {};
    if (filters.startDate) query.orderDate.$gte = new Date(filters.startDate);
    if (filters.endDate) query.orderDate.$lte = new Date(filters.endDate);
  }

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    PurchaseOrder.find(query)
      .populate("supplierId", "name phone")
      .populate("items.productId", "name")
      .populate("createdBy", "fullName")
      .populate("approvedBy", "fullName")
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit),
    PurchaseOrder.countDocuments(query),
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
  createPurchaseOrder,
  approvePurchaseOrder,
  receivePurchaseOrder,
  cancelPurchaseOrder,
  getPurchaseOrders,
};
