const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema(
    {
        ipAddress: {
            type: String,
            default: "Unknown",
            trim: true
        },

        page: {
            type: String,
            default: "/",
            trim: true
        },

        method: {
            type: String,
            default: "GET",
            trim: true
        },

        referrer: {
            type: String,
            default: "Direct",
            trim: true
        },

        browser: {
            type: String,
            default: "Unknown",
            trim: true
        },

        device: {
            type: String,
            default: "Unknown",
            trim: true
        },

        userAgent: {
            type: String,
            default: "Unknown"
        },

        visitDate: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Visitor",
    visitorSchema
);