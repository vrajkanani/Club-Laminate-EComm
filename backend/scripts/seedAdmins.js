const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const User = require("../models/User");

const admins = [
  {
    fullName: "Master Admin",
    email: "admin@clublaminate.com",
    password: "adminPassword123",
    role: "admin",
  },
  {
    fullName: "Vraj Kanani",
    email: "vraj.kanani@clublaminate.com",
    password: "vrajPassword123",
    role: "admin",
  },
];

const seedAdmins = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("MONGO_URI is not defined in .env file");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    for (const adminData of admins) {
      const adminExists = await User.findOne({ email: adminData.email });

      if (adminExists) {
        console.log(
          `User already exists with email: ${adminData.email}. Skipping...`,
        );
        continue;
      }

      const admin = new User(adminData);
      await admin.save();
      console.log(`Successfully created admin user: ${adminData.email}`);
    }

    console.log("Seeding completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admins:", error);
    process.exit(1);
  }
};

seedAdmins();
