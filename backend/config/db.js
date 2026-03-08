const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB Atlas");
  } catch (error) {
    console.error("❌ Error connecting to MongoDB Atlas:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
