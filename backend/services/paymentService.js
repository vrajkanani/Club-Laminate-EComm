const Payment = require("../models/Payment");
const SalesOrder = require("../models/SalesOrder");
const PurchaseOrder = require("../models/PurchaseOrder");
const { createAuditLog } = require("./auditService");
const {
  AUDIT_ACTIONS,
  ENTITY_TYPES,
  PAYMENT_STATUS,
} = require("../utils/constants");

/**
 * Create a payment record
 * @param {Object} paymentData - Payment data
 * @param {ObjectId} adminId - Admin user ID
 * @param {Object} req - Express request object
 * @returns {Promise<Payment>}
 */
const createPayment = async (paymentData, adminId, req = null) => {
  const payment = new Payment({
    ...paymentData,
    recordedBy: adminId,
  });

  await payment.save();

  // Update order payment status if payment is completed
  if (payment.status === PAYMENT_STATUS.COMPLETED) {
    await updateOrderPaymentStatus(payment.orderId, payment.orderType);
  }

  // Create audit log
  await createAuditLog({
    adminId,
    action: AUDIT_ACTIONS.PAYMENT_RECORDED,
    entityType: ENTITY_TYPES.PAYMENT,
    entityId: payment._id,
    changes: {
      amount: payment.amount,
      paymentMode: payment.paymentMode,
      status: payment.status,
    },
    req,
  });

  return payment;
};

/**
 * Update payment status
 * @param {ObjectId} paymentId - Payment ID
 * @param {string} newStatus - New payment status
 * @param {ObjectId} adminId - Admin user ID
 * @param {Object} req - Express request object
 * @returns {Promise<Payment>}
 */
const updatePaymentStatus = async (
  paymentId,
  newStatus,
  adminId,
  req = null,
) => {
  const payment = await Payment.findById(paymentId);

  if (!payment) {
    throw new Error("Payment not found");
  }

  const oldStatus = payment.status;
  payment.status = newStatus;

  if (newStatus === PAYMENT_STATUS.COMPLETED && !payment.paidAt) {
    payment.paidAt = new Date();
  }

  await payment.save();

  // Update order payment status
  await updateOrderPaymentStatus(payment.orderId, payment.orderType);

  // Create audit log
  await createAuditLog({
    adminId,
    action: AUDIT_ACTIONS.PAYMENT_UPDATED,
    entityType: ENTITY_TYPES.PAYMENT,
    entityId: paymentId,
    changes: {
      oldStatus,
      newStatus,
    },
    req,
  });

  return payment;
};

/**
 * Update order payment status based on payments
 * @param {ObjectId} orderId - Order ID
 * @param {string} orderType - Order type (SalesOrder or PurchaseOrder)
 * @returns {Promise<void>}
 */
const updateOrderPaymentStatus = async (orderId, orderType) => {
  const Model = orderType === "SalesOrder" ? SalesOrder : PurchaseOrder;
  const order = await Model.findById(orderId);

  if (!order) return;

  // Get all payments for this order
  const payments = await Payment.find({ orderId, orderType });

  const totalPaid = payments
    .filter((p) => p.status === PAYMENT_STATUS.COMPLETED)
    .reduce((sum, p) => sum + p.amount, 0);

  let paymentStatus = PAYMENT_STATUS.PENDING;

  if (totalPaid >= order.totalAmount) {
    paymentStatus = PAYMENT_STATUS.PAID;
  } else if (totalPaid > 0) {
    paymentStatus = PAYMENT_STATUS.PARTIAL;
  }

  // Update order payment status (only for SalesOrder)
  if (orderType === "SalesOrder" && order.paymentStatus !== paymentStatus) {
    order.paymentStatus = paymentStatus;
    await order.save();
  }
};

/**
 * Get payments for an order
 * @param {ObjectId} orderId - Order ID
 * @param {string} orderType - Order type
 * @returns {Promise<Array>}
 */
const getOrderPayments = async (orderId, orderType) => {
  const payments = await Payment.find({ orderId, orderType })
    .populate("recordedBy", "fullName")
    .sort({ createdAt: -1 });

  return payments;
};

/**
 * Get all payments with filters and pagination
 * @param {Object} filters - Filter options
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<Object>}
 */
const getPayments = async (filters = {}, page = 1, limit = 20) => {
  const query = {};

  if (filters.partyId) query.partyId = filters.partyId;
  if (filters.orderType) query.orderType = filters.orderType;
  if (filters.status) query.status = filters.status;
  if (filters.paymentMode) query.paymentMode = filters.paymentMode;
  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
  }

  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    Payment.find(query)
      .populate("partyId", "name")
      .populate("userId", "fullName")
      .populate("recordedBy", "fullName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Payment.countDocuments(query),
  ]);

  return {
    payments,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

module.exports = {
  createPayment,
  updatePaymentStatus,
  getOrderPayments,
  getPayments,
};
