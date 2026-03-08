const AuditLog = require("../models/AuditLog");

// @desc    Get all audit logs
// @route   GET /api/audit-logs
// @access  Private (Admin)
exports.getAllAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate("user", "fullName email")
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(logs);
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Create an audit log (internal helper)
exports.createAuditLog = async ({
  action,
  entityType,
  entityId,
  userId,
  details,
  changes,
  req,
}) => {
  try {
    const log = new AuditLog({
      user: userId,
      action,
      entityType,
      entityId,
      changes,
      details,
      ipAddress: req?.ip,
      userAgent: req?.headers["user-agent"],
    });
    await log.save();
  } catch (error) {
    console.error("Error creating audit log:", error);
  }
};
