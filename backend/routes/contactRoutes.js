const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/contact", contactController.submitContact);
router.get(
  "/messages",
  protect,
  authorize("admin"),
  contactController.getAllContacts,
);
router.delete(
  "/messages/:id",
  protect,
  authorize("admin"),
  contactController.deleteContact,
);
router.put(
  "/messages/:id/status",
  protect,
  authorize("admin"),
  contactController.updateContactStatus,
);

module.exports = router;
