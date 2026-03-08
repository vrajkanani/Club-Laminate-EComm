const express = require("express");
const router = express.Router();
const { getAllAuditLogs } = require("../controllers/auditLogController");

router.route("/audit-logs").get(getAllAuditLogs);

module.exports = router;
