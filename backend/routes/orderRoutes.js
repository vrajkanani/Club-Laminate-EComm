const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Customer Routes
router.post("/orders/book", protect, orderController.bookOrder);
router.get("/orders/myorders", protect, orderController.getMyOrders);

// Pending Orders
router.get(
  "/orders",
  protect,
  authorize("admin"),
  orderController.getAllOrders,
);
router.get("/orders/:id", protect, orderController.getOrderById);

// Admin Routes
router.delete(
  "/orders/:id",
  protect,
  authorize("admin"),
  orderController.deleteOrder,
);

router.put("/orders/:id/pay", protect, orderController.updatePaymentStatus);

router.put(
  "/orders/:id/status",
  protect,
  authorize("admin"),
  orderController.updateOrderStatus,
);

// Confirmed Orders
router.get(
  "/confirmed-orders",
  protect,
  authorize("admin"),
  orderController.getAllConfirmedOrders,
);
router.get(
  "/confirmed-orders/:id",
  protect,
  authorize("admin"),
  orderController.getConfirmedOrderById,
);
router.post(
  "/orders/confirm",
  protect,
  authorize("admin"),
  orderController.confirmOrder,
);
router.delete(
  "/confirmed-orders/:id",
  protect,
  authorize("admin"),
  orderController.deleteConfirmedOrder,
);

module.exports = router;
