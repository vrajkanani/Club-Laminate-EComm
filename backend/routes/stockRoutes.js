const express = require("express");
const router = express.Router();
const stockController = require("../controllers/stockController");
const { protect, authorize } = require("../middleware/authMiddleware");

// All stock routes are protected and admin only
router.use(protect);
router.use(authorize("admin"));

router.get("/", stockController.getStockList);
router.get("/low-stock", stockController.getLowStock);
router.post("/:id/adjust", stockController.adjustStock);

module.exports = router;
