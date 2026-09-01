const mongoose = require("mongoose");


// ========================================
// CONNECT MONGODB
// ========================================

const connectDB = async () => {

    try {

        const mongoURI =
            process.env.MONGODB_URI;

        console.log(
            "Connecting to MongoDB..."
        );

        console.log(
            "MongoDB URI:",
            mongoURI
                ? "Loaded"
                : "NOT FOUND"
        );


        if (!mongoURI) {

            throw new Error(
                "MONGODB_URI is missing from .env"
            );

        }


        await mongoose.connect(
            mongoURI
        );


        console.log(
            "MongoDB connected successfully"
        );


    } catch (error) {

        console.error(
            "MongoDB connection failed:"
        );

        console.error(
            error.message
        );

        throw error;

    }

};


module.exports = connectDB;