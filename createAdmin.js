const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const path = require("path");

const Admin = require("./models/Admin");


// ========================================
// LOAD ENVIRONMENT VARIABLES
// ========================================

dotenv.config({
    path: path.join(__dirname, ".env")
});


// ========================================
// CREATE ADMIN
// ========================================

async function createAdmin() {

    try {

        // Check MongoDB URI

        if (!process.env.MONGODB_URI) {

            console.error(
                "❌ MONGODB_URI is missing in .env"
            );

            process.exit(1);

        }


        // Connect MongoDB

        await mongoose.connect(
            process.env.MONGODB_URI
        );


        console.log(
            "✅ MongoDB connected"
        );


        // ========================================
        // ADMIN DETAILS
        // ========================================

        const name = "Yogita Patola Art";

        const email = "admin@yogitapatolaart.com";

        const password = "Yogita@Admin2026";


        // ========================================
        // CHECK EXISTING ADMIN
        // ========================================

        const existingAdmin =
            await Admin.findOne({
                email
            });


        if (existingAdmin) {

            console.log(
                "⚠️ Admin already exists."
            );

            await mongoose.connection.close();

            process.exit(0);

        }


        // ========================================
        // HASH PASSWORD
        // ========================================

        const hashedPassword =
            await bcrypt.hash(
                password,
                12
            );


        // ========================================
        // CREATE ADMIN
        // ========================================

        const admin = new Admin({

            name,

            email,

            password: hashedPassword

        });


        await admin.save();


        console.log(
            "========================================"
        );

        console.log(
            "✅ ADMIN CREATED SUCCESSFULLY"
        );

        console.log(
            "========================================"
        );

        console.log(
            "Email:",
            email
        );

        console.log(
            "Password:",
            password
        );

        console.log(
            "========================================"
        );


        // Close database

        await mongoose.connection.close();

        process.exit(0);


    } catch (error) {

        console.error(
            "❌ Error creating admin:"
        );

        console.error(
            error.message
        );


        try {

            await mongoose.connection.close();

        } catch (closeError) {

            // Ignore close error

        }


        process.exit(1);

    }

}


// ========================================
// RUN
// ========================================

createAdmin();