const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const upload = require("../middleware/uploadMiddleware");
const { protect, authorize } = require("../middleware/authMiddleware");

// Public routes
router.get("/products", productController.getAllProducts);
router.get("/products/:id", productController.getProductById);

// Private (Admin) routes
router.post(
  "/products",
  protect,
  authorize("admin"),
  upload.single("image"),
  productController.createProduct,
);
router.put(
  "/products/:id",
  protect,
  authorize("admin"),
  upload.single("image"),
  productController.updateProduct,
);
router.delete(
  "/products/:id",
  protect,
  authorize("admin"),
  productController.deleteProduct,
);

module.exports = router;
