const mongoose = require("mongoose");


// ==================================================
// USER SCHEMA
// ==================================================

const userSchema = new mongoose.Schema(
    {

        // ------------------------------------------
        // USER NAME
        // ------------------------------------------

        name: {

            type: String,

            required: true,

            trim: true,

            minlength: 2,

            maxlength: 100

        },


        // ------------------------------------------
        // EMAIL
        // ------------------------------------------

        email: {

            type: String,

            required: true,

            unique: true,

            lowercase: true,

            trim: true

        },


        // ------------------------------------------
        // PASSWORD
        // ------------------------------------------

        password: {

            type: String,

            required: true

        },


        // ------------------------------------------
        // PHONE
        // ------------------------------------------
        // Phone abhi OTP verification ke liye
        // use nahi ho raha.
        // Future me mobile OTP ke liye use kar sakte hain.

        phone: {

            type: String,

            default: "",

            trim: true

        },


        // ------------------------------------------
        // PHONE VERIFIED
        // ------------------------------------------

        phoneVerified: {

            type: Boolean,

            default: false

        },


        // ------------------------------------------
        // EMAIL VERIFIED
        // ------------------------------------------

        emailVerified: {

            type: Boolean,

            default: false

        },


        // ------------------------------------------
        // EMAIL OTP
        // ------------------------------------------

        emailOTP: {

            type: String,

            default: ""

        },


        // ------------------------------------------
        // EMAIL OTP EXPIRY
        // ------------------------------------------

        emailOTPExpires: {

            type: Date,

            default: null

        },


        // ------------------------------------------
        // ACCOUNT STATUS
        // ------------------------------------------

        isActive: {

            type: Boolean,

            default: true

        }

    },

    {

        timestamps: true

    }
);


// ==================================================
// EXPORT MODEL
// ==================================================

module.exports = mongoose.model(
    "User",
    userSchema
);