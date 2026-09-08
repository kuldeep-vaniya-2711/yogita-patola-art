const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true },
        phone: { type: String, default: "", trim: true },
        phoneVerified: { type: Boolean, default: false },
        emailVerified: { type: Boolean, default: false },
        emailOTP: { type: String, default: "" },
        emailOTPExpires: { type: Date, default: null },
        passwordResetOTP: { type: String, default: "" },
        passwordResetOTPExpires: { type: Date, default: null },
        passwordResetVerified: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);