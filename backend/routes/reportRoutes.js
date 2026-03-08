const express = require("express");
const router = express.Router();
const { getSummaryReport } = require("../controllers/reportController");

router.get("/reports/summary", getSummaryReport);

module.exports = router;
