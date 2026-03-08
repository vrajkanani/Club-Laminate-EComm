const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const User = require("../models/User");

const createAdmin = async () => {
  const email = process.argv[2];
  const password = process.argv[3];
  const fullName = process.argv[4] || "Admin User";

  if (!email || !password) {
    console.log("Usage: node createAdmin.js <email> <password> [fullName]");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    const adminExists = await User.findOne({ email });
    if (adminExists) {
      console.log("User already exists with this email.");
      process.exit(1);
    }

    const admin = new User({
      fullName,
      email,
      password,
      role: "admin",
    });

    await admin.save();
    console.log(`Successfully created admin user: ${email}`);
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();
