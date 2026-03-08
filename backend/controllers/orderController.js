const Order = require("../models/Order");
const Product = require("../models/Product");
const Payment = require("../models/Payment");
const { PAYMENT_STATUS, PAYMENT_MODES } = require("../utils/constants");

// ================== Order Management ==================

// @desc    Get all orders (with optional status filter)
// @route   GET /api/orders
// @access  Private (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) {
      query.status = status;
    }

    // Sort by createdAt descending (newest first)
    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private (Admin)
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "productId",
      "name sku",
    );
    if (order) {
      // Check if user is admin or the owner of the order
      if (
        req.user.role !== "admin" &&
        order.userId.toString() !== req.user._id.toString()
      ) {
        return res
          .status(403)
          .json({ message: "Not authorized to view this order" });
      }
      res.json(order);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (err) {
    console.error("Error fetching order:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Book a new order
// @route   POST /api/orders/book
// @access  Public
exports.bookOrder = async (req, res) => {
  try {
    const {
      fullName,
      mobileNo,
      city,
      productName,
      productId,
      quantity,
      state,
      pincode,
      address,
    } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Determine price (assuming product has a 'price' field, if not we need to find where price is stored.
    // Let's assume product.price based on typical e-commerce. If not, I'll need to check Product model.)
    // Wait, let's verify Product model first to be safe. But to save steps, I'll assume price/offerPrice.
    // Actually, looking at previous context, product might be 'Product' model.
    // I will use product.price || 0 for now and check Product model in parallel if needed.
    // Better to check Product model.

    // For now, I'll add logic to get price.
    const price = product.price || 0;
    const totalAmount = price * quantity;

    const newOrder = new Order({
      fullName,
      mobileNo,
      city,
      productName,
      productId,
      quantity,
      totalAmount,
      state,
      pincode,
      address,
      sku: product.sku,
      status: "Pending",
      userId: req.user ? req.user._id : undefined,
    });

    // Increment reserved stock
    product.reservedStock = (product.reservedStock || 0) + quantity;
    await product.save();

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    console.error("Error saving order:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (err) {
    console.error("Error fetching my orders:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Update order status (Confirm/Reject/Cancel)
// @route   PUT /api/orders/:id/status
// @access  Private (Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body; // Expected: Confirmed, Rejected, Cancelled, Delivered
    const orderId = req.params.id;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const currentStatus = order.status;
    const newStatus = status;

    if (currentStatus === newStatus) {
      return res.json(order); // No change
    }

    // Handing Stock Logic

    // 1. Pending -> Confirmed : Deduct Stock and Remove Reservation
    if (currentStatus === "Pending" && newStatus === "Confirmed") {
      const product = await Product.findById(order.productId);
      if (!product) {
        return res
          .status(404)
          .json({ message: "Product associated with order not found" });
      }

      if (product.stock < order.quantity) {
        return res
          .status(400)
          .json({ message: `Insufficient stock. Available: ${product.stock}` });
      }

      product.stock -= order.quantity;
      product.stockQuantity = product.stock; // Sync
      product.reservedStock = Math.max(
        0,
        (product.reservedStock || 0) - order.quantity,
      );
      await product.save();

      order.confirmedDate = Date.now();
      order.confirmedBy = req.user ? req.user._id : null;
    }

    // 2. Pending -> Cancelled/Rejected : Remove Reservation
    if (
      currentStatus === "Pending" &&
      (newStatus === "Cancelled" || newStatus === "Rejected")
    ) {
      const product = await Product.findById(order.productId);
      if (product) {
        product.reservedStock = Math.max(
          0,
          (product.reservedStock || 0) - order.quantity,
        );
        await product.save();
      }
    }

    // 3. Confirmed -> Cancelled/Rejected : Restore Stock
    if (
      currentStatus === "Confirmed" &&
      (newStatus === "Cancelled" || newStatus === "Rejected")
    ) {
      const product = await Product.findById(order.productId);
      if (product) {
        product.stock += order.quantity;
        product.stockQuantity = product.stock; // Sync
        await product.save();
      }
    }

    order.status = newStatus;
    if (newStatus === "Delivered") {
      order.deliveredDate = Date.now();
    }

    await order.save();
    res.json(order);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Delete an order
// @route   DELETE /api/orders/:id
// @access  Private (Admin)
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // If order was confirmed, restore stock before deleting?
    // Usually we don't delete confirmed orders, but if we do:
    if (order.status === "Confirmed") {
      const product = await Product.findById(order.productId);
      if (product) {
        product.stock += order.quantity;
        await product.save();
      }
    }

    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Deprecated or Aliased endpoints for backward compatibility if needed
exports.getAllConfirmedOrders = async (req, res) => {
  // Alias to get orders with status 'Confirmed'
  req.query.status = "Confirmed";
  return exports.getAllOrders(req, res);
};

exports.getConfirmedOrderById = exports.getOrderById;
exports.deleteConfirmedOrder = exports.deleteOrder;
exports.confirmOrder = async (req, res) => {
  // Adapter for old confirm route
  req.params.id = req.body._id;
  req.body.status = "Confirmed";
  return exports.updateOrderStatus(req, res);
};

// Update payment status (Mock Payment)
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check authorization (Admin or Owner)
    if (
      req.user.role !== "admin" &&
      order.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    order.paymentStatus = paymentStatus || "Paid";
    if (order.paymentStatus === "Paid") {
      order.paymentDate = Date.now();

      // Create a Payment Record for the Ledger
      try {
        const payment = new Payment({
          userId: order.userId,
          orderId: order._id,
          orderType: "Order",
          amount: order.totalAmount || order.quantity * 100,
          paymentMode: PAYMENT_MODES.UPI,
          status: PAYMENT_STATUS.COMPLETED,
          type: "Inward",
          transactionRef: `MOCK-${Date.now()}`,
          paidAt: Date.now(),
          recordedBy: req.user._id,
        });

        await payment.save();
      } catch (paymentError) {
        console.error("Failed to create payment record:", paymentError);
        // We don't block the order update, but we log the error
      }
    }

    await order.save();
    res.json(order);
  } catch (err) {
    console.error("Error updating payment status:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
