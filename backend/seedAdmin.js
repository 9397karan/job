require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");

const createAdmin = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log("MongoDB connected.");

    const email =
      process.env.ADMIN_EMAIL ||
      "admin@jobconnect.com";

    const password =
      process.env.ADMIN_PASSWORD ||
      "Admin@123";

    const existingAdmin =
      await User.findOne({
        email,
      });

    if (existingAdmin) {
      console.log(
        "Admin already exists."
      );

      process.exit(0);
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const admin = await User.create({
      name: "JobConnect Admin",
      email,
      password: hashedPassword,
      role: "ADMIN",
      isActive: true,
      isSuspended: false,
    });

    console.log(
      "Admin created successfully."
    );

    console.log(
      "Email:",
      admin.email
    );

    console.log(
      "Password:",
      password
    );

    process.exit(0);
  } catch (error) {
    console.error(
      "Admin creation failed:",
      error
    );

    process.exit(1);
  }
};

createAdmin();