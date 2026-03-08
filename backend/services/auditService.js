const AuditLog = require("../models/AuditLog");

/**
 * Create an audit log entry
 * @param {Object} params - Audit log parameters
 * @param {ObjectId} params.adminId - Admin user ID
 * @param {string} params.action - Action performed
 * @param {string} params.entityType - Type of entity
 * @param {ObjectId} params.entityId - Entity ID
 * @param {Object} params.changes - Optional changes object
 * @param {Object} params.req - Optional Express request object for IP and user agent
 * @returns {Promise<AuditLog>}
 */
const createAuditLog = async ({
  adminId,
  action,
  entityType,
  entityId,
  changes = null,
  req = null,
}) => {
  try {
    const auditData = {
      adminId,
      action,
      entityType,
      entityId,
      timestamp: new Date(),
    };

    if (changes) {
      auditData.changes = changes;
    }

    if (req) {
      auditData.ipAddress = req.ip || req.connection.remoteAddress;
      auditData.userAgent = req.get("user-agent");
    }

    const auditLog = await AuditLog.create(auditData);
    return auditLog;
  } catch (error) {
    console.error("Error creating audit log:", error);
    // Don't throw error - audit logging should not break main operations
    return null;
  }
};

/**
 * Get audit logs for a specific entity
 * @param {string} entityType - Type of entity
 * @param {ObjectId} entityId - Entity ID
 * @param {number} limit - Number of logs to retrieve
 * @returns {Promise<Array>}
 */
const getEntityAuditLogs = async (entityType, entityId, limit = 50) => {
  try {
    const logs = await AuditLog.find({ entityType, entityId })
      .populate("adminId", "fullName email")
      .sort({ timestamp: -1 })
      .limit(limit);

    return logs;
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    throw error;
  }
};

/**
 * Get all audit logs with pagination
 * @param {Object} filters - Filter options
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<Object>}
 */
const getAllAuditLogs = async (filters = {}, page = 1, limit = 20) => {
  try {
    const query = {};

    if (filters.adminId) query.adminId = filters.adminId;
    if (filters.entityType) query.entityType = filters.entityType;
    if (filters.action) query.action = filters.action;
    if (filters.startDate || filters.endDate) {
      query.timestamp = {};
      if (filters.startDate) query.timestamp.$gte = new Date(filters.startDate);
      if (filters.endDate) query.timestamp.$lte = new Date(filters.endDate);
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate("adminId", "fullName email")
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit),
      AuditLog.countDocuments(query),
    ]);

    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    throw error;
  }
};

module.exports = {
  createAuditLog,
  getEntityAuditLogs,
  getAllAuditLogs,
};
