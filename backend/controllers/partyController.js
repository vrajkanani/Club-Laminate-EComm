const Party = require("../models/Party");

// @desc    Get all parties
// @route   GET /api/parties
// @access  Private (Admin)
exports.getAllParties = async (req, res) => {
  try {
    const { type } = req.query;
    let query = {};
    if (type) query.partyType = type.toLowerCase();

    const parties = await Party.find(query).sort({ name: 1 });
    res.json(parties);
  } catch (error) {
    console.error("Error fetching parties:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Get parties by type (Customer/Supplier)
// @route   GET /api/parties/type/:type
// @access  Private (Admin)
exports.getPartiesByType = async (req, res) => {
  try {
    const { type } = req.params;
    const parties = await Party.find({ partyType: type.toLowerCase() }).sort({
      name: 1,
    });
    res.json(parties);
  } catch (error) {
    console.error("Error fetching parties by type:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Create a party
// @route   POST /api/parties
// @access  Private (Admin)
exports.createParty = async (req, res) => {
  try {
    const { name, contactPerson, email, phone, address, gstNo, type } =
      req.body;

    // Handle address: if string, put in street, otherwise use as is or default to object
    const addressObj =
      typeof address === "string" ? { street: address } : address;

    // Ensure type matches enum (lowercase)
    const normalizedType = type ? type.toLowerCase() : type;

    const party = new Party({
      name,
      contactPerson,
      partyType: normalizedType,
      email: email === "" ? undefined : email, // Handle empty string for sparse index
      phone,
      address: addressObj,
      gst: gstNo, // Map gstNo to gst
    });

    const savedParty = await party.save();
    res.status(201).json(savedParty);
  } catch (error) {
    console.error("Error creating party:", error);
    // Use 400 for validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

// @desc    Update a party
// @route   PUT /api/parties/:id
// @access  Private (Admin)
exports.updateParty = async (req, res) => {
  try {
    const { name, contactPerson, email, phone, address, gstNo, type } =
      req.body;

    // Ensure type matches enum (lowercase)
    const normalizedType = type ? type.toLowerCase() : type;

    const updateData = {
      name,
      contactPerson,
      partyType: normalizedType,
      email: email === "" ? undefined : email, // Handle empty string for sparse index
      phone,
      gst: gstNo,
      address: typeof address === "string" ? { street: address } : address,
    };

    // Remove undefined keys so they don't unset existing values if we didn't want to?
    // Actually for updates, if we pass undefined to findByIdAndUpdate with new object, it might unset?
    // Mongoose update operators ($set) are usually better, but passing an object works too.
    // However, if we pass { email: undefined }, it might not actually unset it in mongo (unset requires $unset).
    // But if we want to CLEAR an email, sending "" -> undefined might just do nothing.
    // If the user wants to clear email, we should set it to null.
    // Let's set it to null if it's empty string.

    if (email === "") updateData.email = null;

    const party = await Party.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!party) return res.status(404).json({ message: "Party not found" });
    res.json(party);
  } catch (error) {
    console.error("Error updating party:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

// @desc    Delete a party
// @route   DELETE /api/parties/:id
// @access  Private (Admin)
exports.deleteParty = async (req, res) => {
  try {
    const party = await Party.findByIdAndDelete(req.params.id);
    if (!party) return res.status(404).json({ message: "Party not found" });
    res.json({ message: "Party deleted successfully" });
  } catch (error) {
    console.error("Error deleting party:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
