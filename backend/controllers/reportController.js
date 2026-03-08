const Order = require("../models/Order");
const Payment = require("../models/Payment");
const Product = require("../models/Product");
const Contact = require("../models/Contact");
const { PAYMENT_STATUS } = require("../utils/constants");

// @desc    Get dashboard summary reports
// @route   GET /api/reports/summary
// @access  Private (Admin)
exports.getSummaryReport = async (req, res) => {
  try {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const totalPending = await Order.countDocuments({ status: "Pending" });
    const totalConfirmed = await Order.countDocuments({ status: "Confirmed" });
    const totalProducts = await Product.countDocuments();
    const totalPendingInquiries = await Contact.countDocuments({
      status: "Pending",
    });

    // Total Revenue (All time)
    const totalPayments = await Payment.aggregate([
      { $match: { type: "Inward", status: PAYMENT_STATUS.COMPLETED } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // Current Month Revenue
    const thisMonthRevenueData = await Payment.aggregate([
      {
        $match: {
          type: "Inward",
          status: PAYMENT_STATUS.COMPLETED,
          createdAt: { $gte: startOfCurrentMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // Last Month Revenue
    const lastMonthRevenueData = await Payment.aggregate([
      {
        $match: {
          type: "Inward",
          status: PAYMENT_STATUS.COMPLETED,
          createdAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // Confirmed Orders Trend
    const thisMonthConfirmed = await Order.countDocuments({
      status: "Confirmed",
      createdAt: { $gte: startOfCurrentMonth },
    });
    const lastMonthConfirmed = await Order.countDocuments({
      status: "Confirmed",
      createdAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonth },
    });

    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const revenueChange = calculateChange(
      thisMonthRevenueData[0]?.total || 0,
      lastMonthRevenueData[0]?.total || 0,
    );
    const ordersChange = calculateChange(
      thisMonthConfirmed,
      lastMonthConfirmed,
    );

    // Sales Trend (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Get the timezone offset in format '+HH:mm' or '-HH:mm'
    const offsetMinutes = -new Date().getTimezoneOffset();
    const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
    const offsetMins = Math.abs(offsetMinutes) % 60;
    const timezone =
      (offsetMinutes >= 0 ? "+" : "-") +
      String(offsetHours).padStart(2, "0") +
      ":" +
      String(offsetMins).padStart(2, "0");

    const salesTrend = await Payment.aggregate([
      {
        $match: {
          type: "Inward",
          status: PAYMENT_STATUS.COMPLETED,
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: timezone,
            },
          },
          amount: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill missing dates in salesTrend using local dates
    const formattedTrend = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo);
      date.setDate(date.getDate() + i);

      // Get local YYYY-MM-DD
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      const match = salesTrend.find((s) => s._id === dateStr);
      formattedTrend.push({
        date: dateStr,
        amount: match ? match.amount : 0,
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
      });
    }

    // Inventory Efficiency
    const inventoryData = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalStock: { $sum: "$stockQuantity" },
          totalReserved: { $sum: "$reservedStock" },
        },
      },
    ]);

    const inv = inventoryData[0] || { totalStock: 0, totalReserved: 0 };
    const utilizationRate =
      inv.totalStock > 0
        ? Math.round((inv.totalReserved / inv.totalStock) * 100)
        : 0;

    res.json({
      pendingOrders: totalPending,
      confirmedOrders: totalConfirmed,
      totalRevenue: totalPayments[0]?.total || 0,
      totalProducts,
      pendingInquiries: totalPendingInquiries,
      revenueChange: revenueChange.toFixed(1),
      ordersChange: ordersChange.toFixed(1),
      salesTrend: formattedTrend,
      inventoryEfficiency: {
        utilizationRate,
        totalStock: inv.totalStock,
        totalReserved: inv.totalReserved,
        idleCapacity: inv.totalStock - inv.totalReserved,
      },
    });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
