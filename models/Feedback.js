const mongoose = require("mongoose");


// =========================================================
// FEEDBACK SCHEMA
// =========================================================

const feedbackSchema = new mongoose.Schema(
    {

        // -------------------------------------------------
        // NAME
        // -------------------------------------------------

        name: {
            type: String,
            required: true,
            trim: true
        },


        // -------------------------------------------------
        // EMAIL
        // -------------------------------------------------

        email: {
            type: String,
            trim: true,
            lowercase: true
        },


        // -------------------------------------------------
        // FEEDBACK TYPE
        // -------------------------------------------------

        type: {
            type: String,
            enum: [
                "General",
                "Suggestion",
                "Complaint",
                "Product",
                "Service"
            ],
            default: "General",
            trim: true
        },


        // -------------------------------------------------
        // MESSAGE
        // -------------------------------------------------

        message: {
            type: String,
            required: true,
            trim: true
        },


        // -------------------------------------------------
        // RATING
        // -------------------------------------------------

        rating: {
            type: Number,
            min: 1,
            max: 5,
            default: null
        },


        // -------------------------------------------------
        // FEEDBACK STATUS
        // -------------------------------------------------

        status: {
            type: String,
            enum: [
                "New",
                "Read",
                "Resolved"
            ],
            default: "New",
            trim: true
        }

    },
    {

        timestamps: true

    }
);


// =========================================================
// EXPORT MODEL
// =========================================================

module.exports = mongoose.model(
    "Feedback",
    feedbackSchema
);
