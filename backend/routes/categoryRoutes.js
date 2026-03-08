const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Private (Admin) routes
router.get(
  "/admin",
  protect,
  authorize("admin"),
  categoryController.getAdminCategories,
);

// Public routes
router.get("/", categoryController.getCategories);
router.get("/:slug", categoryController.getCategoryBySlug);
router.post(
  "/",
  protect,
  authorize("admin"),
  categoryController.createCategory,
);
router.put(
  "/:id",
  protect,
  authorize("admin"),
  categoryController.updateCategory,
);
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  categoryController.deleteCategory,
);

module.exports = router;
