const Contact = require("../models/Contact");

// @desc    Get all contact messages
// @route   GET /api/messages
// @access  Private (Admin)
exports.getAllContacts = async (req, res) => {
  try {
    const messages = await Contact.find({}).sort({
      status: -1, // Pending before Replied if alphabetical, but we might want Pending first.
      // Actually 'Pending' > 'Replied' alphabetically? P is before R.
      // Let's just sort by createdAt -1 for now, or status.
      createdAt: -1,
    });
    res.json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Submit a contact message
// @route   POST /api/contact
// @access  Public
exports.submitContact = async (req, res) => {
  const { name, email, message } = req.body;
  try {
    const newContact = new Contact({ name, email, message });
    const savedContact = await newContact.save();
    res.status(201).json(savedContact);
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ message: "Error saving message" });
  }
};

// @desc    Delete a contact message
// @route   DELETE /api/messages/:id
// @access  Private (Admin)
exports.deleteContact = async (req, res) => {
  try {
    const deletedMessage = await Contact.findByIdAndDelete(req.params.id);
    if (deletedMessage) res.json({ message: "Message deleted successfully" });
    else res.status(404).json({ message: "Message not found" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Update contact status
// @route   PUT /api/messages/:id/status
// @access  Private (Admin)
exports.updateContactStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );
    if (updatedContact) res.json(updatedContact);
    else res.status(404).json({ message: "Message not found" });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
