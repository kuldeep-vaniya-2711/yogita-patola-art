const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const path = require("path");
const Admin = require("./models/Admin");

dotenv.config({ path: path.join(__dirname, ".env") });

async function createAdmin() {
    try {
        if (!process.env.MONGODB_URI) {
            console.error("❌ MONGODB_URI is missing in .env");
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ MongoDB connected");

        const name = "Yogita Patola Art";
        const email = "admin@yogitapatolaart.com";
        const password = "Yogita@Admin2026";

        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            console.log("⚠️ Admin already exists.");
            await mongoose.connection.close();
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const admin = new Admin({ name, email, password: hashedPassword });
        await admin.save();

        console.log("========================================");
        console.log("✅ ADMIN CREATED SUCCESSFULLY");
        console.log("========================================");
        console.log("Email:", email);
        console.log("Password:", password);
        console.log("========================================");

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("❌ Error creating admin:", error.message);
        try {
            await mongoose.connection.close();
        } catch (_) {}
        process.exit(1);
    }
}

createAdmin();