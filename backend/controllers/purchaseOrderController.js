const PurchaseOrder = require("../models/PurchaseOrder");
const Product = require("../models/Product");
const {
  PURCHASE_ORDER_STATUS,
  AUDIT_ACTIONS,
  ENTITY_TYPES,
} = require("../utils/constants");
const { withTransaction } = require("../utils/transactionHelper");
const { createAuditLog } = require("./auditLogController");

// @desc    Get all purchase orders
// @route   GET /api/purchase-orders
// @access  Private (Admin)
exports.getAllPurchaseOrders = async (req, res) => {
  try {
    const { status, supplierId, search } = req.query;
    let query = {};

    if (status) query.status = status;
    if (supplierId) query.supplierId = supplierId;

    const pos = await PurchaseOrder.find(query)
      .populate("supplierId", "name contactPerson phone")
      .sort({ createdAt: -1 });

    // Client-side filtering/search if needed, or expand query
    let filteredPOs = pos;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPOs = pos.filter(
        (po) =>
          po.poNumber.toLowerCase().includes(searchLower) ||
          po.supplierId?.name.toLowerCase().includes(searchLower),
      );
    }

    res.json(filteredPOs);
  } catch (error) {
    console.error("Error fetching purchase orders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Get purchase order by ID
// @route   GET /api/purchase-orders/:id
// @access  Private (Admin)
exports.getPurchaseOrderById = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id)
      .populate("supplierId")
      .populate("items.productId", "name sku price image");

    if (!po) {
      return res.status(404).json({ message: "Purchase order not found" });
    }

    res.json(po);
  } catch (error) {
    console.error("Error fetching purchase order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Create new purchase order
// @route   POST /api/purchase-orders
// @access  Private (Admin)
exports.createPurchaseOrder = async (req, res) => {
  try {
    const { supplierId, items, expectedDeliveryDate, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "At least one item is required" });
    }

    const po = new PurchaseOrder({
      supplierId,
      items,
      expectedDeliveryDate: expectedDeliveryDate || null,
      notes,
      createdBy: req.user._id,
      status: PURCHASE_ORDER_STATUS.DRAFT,
    });

    await po.save();

    await createAuditLog({
      action: AUDIT_ACTIONS.PURCHASE_ORDER_CREATED,
      entityType: ENTITY_TYPES.PURCHASE_ORDER,
      entityId: po._id,
      userId: req.user._id,
      details: `Created Purchase Order ${po.poNumber}`,
      req,
    });

    res.status(201).json(po);
  } catch (error) {
    console.error("Error creating purchase order:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(400).json({ message: error.message || "Invalid order data" });
  }
};

// @desc    Update purchase order (Draft only)
// @route   PUT /api/purchase-orders/:id
// @access  Private (Admin)
exports.updatePurchaseOrder = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);

    if (!po) {
      return res.status(404).json({ message: "Purchase order not found" });
    }

    if (po.status !== PURCHASE_ORDER_STATUS.DRAFT) {
      return res
        .status(400)
        .json({ message: "Only draft orders can be edited" });
    }

    const { items, expectedDeliveryDate, notes, supplierId } = req.body;

    if (items) po.items = items;
    if (expectedDeliveryDate) po.expectedDeliveryDate = expectedDeliveryDate;
    if (notes) po.notes = notes;
    if (supplierId) po.supplierId = supplierId;

    await po.save();
    res.json(po);
  } catch (error) {
    console.error("Error updating purchase order:", error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Approve purchase order
// @route   POST /api/purchase-orders/:id/approve
// @access  Private (Admin)
exports.approvePurchaseOrder = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);

    if (!po) {
      return res.status(404).json({ message: "Purchase order not found" });
    }

    if (po.status !== PURCHASE_ORDER_STATUS.DRAFT) {
      return res
        .status(400)
        .json({ message: "Order is already approved or processed" });
    }

    po.status = PURCHASE_ORDER_STATUS.APPROVED;
    po.approvedBy = req.user._id;
    await po.save();

    await createAuditLog({
      action: AUDIT_ACTIONS.PURCHASE_ORDER_APPROVED,
      entityType: ENTITY_TYPES.PURCHASE_ORDER,
      entityId: po._id,
      userId: req.user._id,
      details: `Approved Purchase Order ${po.poNumber}`,
      req,
    });

    res.json(po);
  } catch (error) {
    console.error("Error approving purchase order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Receive items and update inventory
// @route   POST /api/purchase-orders/:id/receive
// @access  Private (Admin)
exports.receivePurchaseOrder = async (req, res) => {
  try {
    await withTransaction(async (session) => {
      const po = await PurchaseOrder.findById(req.params.id).session(session);

      if (!po) {
        throw new Error("Purchase order not found");
      }

      if (po.status !== PURCHASE_ORDER_STATUS.APPROVED) {
        throw new Error("Order must be approved before receiving");
      }

      // Update Stock for each item
      for (const item of po.items) {
        const product = await Product.findById(item.productId).session(session);
        if (product) {
          const qty = Number(item.quantity) || 0;
          product.stockQuantity = (product.stockQuantity || 0) + qty;
          product.stock = (product.stock || 0) + qty;
          await product.save({ session });

          // Log Individual Stock increase
          await createAuditLog({
            action: AUDIT_ACTIONS.STOCK_INCREASED,
            entityType: ENTITY_TYPES.PRODUCT,
            entityId: product._id,
            userId: req.user._id,
            details: `Stock increased by ${item.quantity} via PO ${po.poNumber}`,
            req,
          });
        }
      }

      po.status = PURCHASE_ORDER_STATUS.RECEIVED;
      po.receivedDate = new Date();
      await po.save({ session });

      await createAuditLog({
        action: AUDIT_ACTIONS.PURCHASE_ORDER_RECEIVED,
        entityType: ENTITY_TYPES.PURCHASE_ORDER,
        entityId: po._id,
        userId: req.user._id,
        details: `Received Purchase Order ${po.poNumber}`,
        req,
      });
    });

    res.json({ message: "Items received and inventory updated" });
  } catch (error) {
    console.error("Error receiving purchase order:", error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Cancel purchase order
// @route   DELETE /api/purchase-orders/:id
// @access  Private (Admin)
exports.cancelPurchaseOrder = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);

    if (!po) {
      return res.status(404).json({ message: "Purchase order not found" });
    }

    if (po.status === PURCHASE_ORDER_STATUS.RECEIVED) {
      return res
        .status(400)
        .json({ message: "Cannot cancel a received order" });
    }

    po.status = PURCHASE_ORDER_STATUS.CANCELLED;
    await po.save();

    await createAuditLog({
      action: AUDIT_ACTIONS.PURCHASE_ORDER_CANCELLED,
      entityType: ENTITY_TYPES.PURCHASE_ORDER,
      entityId: po._id,
      userId: req.user._id,
      details: `Cancelled Purchase Order ${po.poNumber}`,
      req,
    });

    res.json({ message: "Order cancelled" });
  } catch (error) {
    console.error("Error cancelling purchase order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
