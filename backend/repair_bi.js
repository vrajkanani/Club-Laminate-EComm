const mongoose = require("mongoose");
require("dotenv").config();

const Order = require("./models/Order");
const Product = require("./models/Product");
const Payment = require("./models/Payment");

async function repairAndDebug() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // 1. Sync reservedStock for Products
    console.log("Syncing reservedStock...");
    const products = await Product.find({});
    for (const product of products) {
      const pendingOrders = await Order.find({
        productId: product._id,
        status: "Pending",
      });
      const totalReserved = pendingOrders.reduce(
        (sum, o) => sum + (o.quantity || 0),
        0,
      );
      product.reservedStock = totalReserved;
      await product.save();
      console.log(
        `- Product ${product.name}: set reservedStock to ${totalReserved}`,
      );
    }

    // 2. Debug Sales Aggregation exactly as in reportController
    console.log("\nDebugging Sales Aggregation...");
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const salesTrend = await Payment.aggregate([
      {
        $match: {
          type: "Inward",
          status: "completed",
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          amount: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    console.log("Sales Trend Result:", JSON.stringify(salesTrend, null, 2));

    // Check all inward payments to see their exact status
    const allInward = await Payment.find({ type: "Inward" }).limit(10);
    console.log("\nSample Inward Payments:");
    allInward.forEach((p) => {
      console.log(
        `- ID: ${p._id}, Amt: ${p.amount}, Status: "${p.status}", CreatedAt: ${p.createdAt.toISOString()}`,
      );
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

repairAndDebug();
