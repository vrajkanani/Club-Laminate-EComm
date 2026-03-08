const express = require("express");
const router = express.Router();
const {
  getAllPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  approvePurchaseOrder,
  receivePurchaseOrder,
  cancelPurchaseOrder,
} = require("../controllers/purchaseOrderController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);
router.use(authorize("admin"));

router.route("/").get(getAllPurchaseOrders).post(createPurchaseOrder);

router
  .route("/:id")
  .get(getPurchaseOrderById)
  .put(updatePurchaseOrder)
  .delete(cancelPurchaseOrder);

router.post("/:id/approve", approvePurchaseOrder);
router.post("/:id/receive", receivePurchaseOrder);

module.exports = router;
