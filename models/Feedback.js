const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, trim: true, lowercase: true },
        type: {
            type: String,
            enum: ["General", "Suggestion", "Complaint", "Product", "Service"],
            default: "General",
            trim: true
        },
        message: { type: String, required: true, trim: true },
        rating: { type: Number, min: 1, max: 5, default: null },
        status: { type: String, enum: ["New", "Read", "Resolved"], default: "New", trim: true }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);
