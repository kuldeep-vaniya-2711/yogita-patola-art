const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
        email: { type: String, required: true, trim: true, lowercase: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true, trim: true, minlength: 3, maxlength: 500 },
        approved: { type: Boolean, default: false }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
