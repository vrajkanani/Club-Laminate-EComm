const mongoose = require("mongoose");
require("dotenv").config();

const Payment = require("./models/Payment");

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    console.log("Checking from:", sevenDaysAgo.toISOString());

    const payments = await Payment.find({
      type: "Inward",
      status: "completed",
      createdAt: { $gte: sevenDaysAgo },
    });

    console.log(
      `Found ${payments.length} completed inward payments in last 7 days`,
    );

    if (payments.length > 0) {
      payments.forEach((p) => {
        console.log(
          `- Amount: ${p.amount}, Date: ${p.createdAt.toISOString()}`,
        );
      });
    } else {
      console.log("No matching payments found. Checking ALL inward payments:");
      const allInward = await Payment.find({ type: "Inward" }).limit(5);
      allInward.forEach((p) => {
        console.log(
          `- Amount: ${p.amount}, Status: ${p.status}, Date: ${p.createdAt.toISOString()}`,
        );
      });
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

async function checkInventory() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const Product = require("./models/Product");

    const inventoryData = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalStock: { $sum: "$stockQuantity" },
          totalReserved: { $sum: "$reservedStock" },
        },
      },
    ]);

    console.log(
      "Inventory Aggregation Result:",
      JSON.stringify(inventoryData, null, 2),
    );

    const products = await Product.find({}).limit(3);
    console.log("Sample Products:");
    products.forEach((p) => {
      console.log(
        `- Name: ${p.name}, Stock: ${p.stockQuantity}, Reserved: ${p.reservedStock}`,
      );
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

if (process.argv[2] === "inv") {
  checkInventory();
} else if (process.argv[2] === "orders") {
  checkOrders();
} else {
  checkData();
}

async function checkOrders() {
  try {
    const Order = require("./models/Order");
    await mongoose.connect(process.env.MONGO_URI);

    const pendingOrders = await Order.find({ status: "Pending" });
    console.log(`Found ${pendingOrders.length} Pending orders`);

    pendingOrders.forEach((o) => {
      console.log(
        `- Order: ${o._id}, Quantity: ${o.quantity}, ProductID: ${o.productId}`,
      );
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
