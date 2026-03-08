require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Import Routes
const orderRoutes = require("./routes/orderRoutes");
const authRoutes = require("./routes/authRoutes");
const contactRoutes = require("./routes/contactRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const partyRoutes = require("./routes/partyRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const auditLogRoutes = require("./routes/auditLogRoutes");
const reportRoutes = require("./routes/reportRoutes");
const stockRoutes = require("./routes/stockRoutes");
const purchaseOrderRoutes = require("./routes/purchaseOrderRoutes");
const path = require("path");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Database Connection
connectDB();

// Use Routes
app.use("/api/auth", authRoutes);
app.use("/api", orderRoutes);
app.use("/api", contactRoutes);
app.use("/api", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api", partyRoutes);
app.use("/api", paymentRoutes);
app.use("/api", auditLogRoutes);
app.use("/api", reportRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);

const PORT = process.env.PORT || 3030;

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
