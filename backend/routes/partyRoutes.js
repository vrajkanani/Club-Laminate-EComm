const express = require("express");
const router = express.Router();
const {
  getAllParties,
  createParty,
  updateParty,
  deleteParty,
  getPartiesByType,
} = require("../controllers/partyController");
const { protect, admin } = require("../middleware/authMiddleware");

// Assuming middleware exists or will be added.
// If protect/admin middleware doesn't exist, I'll check and use what's available.

router.route("/parties").get(getAllParties).post(createParty);

// Convenience routes for frontend
router.get("/parties/customers", (req, res, next) => {
  req.query.type = "customer";
  getAllParties(req, res, next);
});

router.get("/parties/suppliers", (req, res, next) => {
  req.query.type = "supplier";
  getAllParties(req, res, next);
});

router.get("/parties/type/:type", getPartiesByType);

router.route("/parties/:id").put(updateParty).delete(deleteParty);

module.exports = router;
