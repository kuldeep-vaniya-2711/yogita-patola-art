const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const { sendOTPEmail } = require("../services/emailService");

function generateOTP() {
    return crypto.randomInt(100000, 1000000).toString();
}

function getOTPExpiry() {
    return new Date(Date.now() + 10 * 60 * 1000);
}

function isOTPExpired(expiry) {
    return !expiry || new Date(expiry).getTime() < Date.now();
}

exports.showForgotPassword = (req, res) => {
    res.render("user/forgot-password", { title: "Forgot Password" });
};

exports.sendPasswordResetOTP = async (req, res) => {
    try {
        const email = String(req.body.email || "").trim().toLowerCase();

        if (!email) {
            return res.render("user/forgot-password", {
                title: "Forgot Password",
                error: "Please enter your email address.",
                email
            });
        }

        const user = await User.findOne({ email });
        if (!user || !user.isActive) {
            return res.render("user/forgot-password", {
                title: "Forgot Password",
                success: "If an account exists with this email, a password reset OTP has been sent.",
                email
            });
        }

        const otp = generateOTP();
        const otpExpiry = getOTPExpiry();

        user.passwordResetOTP = otp;
        user.passwordResetOTPExpires = otpExpiry;
        user.passwordResetVerified = false;
        await user.save();

        req.session.passwordResetEmail = user.email;
        req.session.passwordResetUserId = user._id.toString();
        req.session.passwordResetVerified = false;

        const emailResult = await sendOTPEmail(user.email, user.name, otp);

        console.log("\n=================================\nPASSWORD RESET OTP\nEmail:", user.email, "\nOTP:", otp, "\nExpires:", otpExpiry, "\n=================================\n");

        if (!emailResult || emailResult.success === false) {
            console.error("Password reset email could not be sent.");
            return res.render("user/forgot-password", {
                title: "Forgot Password",
                error: "We could not send the OTP email. Please try again.",
                email
            });
        }

        return res.redirect("/user/verify-reset-otp");
    } catch (error) {
        console.error("Password reset OTP error:", error);
        return res.render("user/forgot-password", {
            title: "Forgot Password",
            error: "Something went wrong. Please try again.",
            email: req.body.email || ""
        });
    }
};

exports.showVerifyResetOTP = async (req, res) => {
    try {
        const email = req.session.passwordResetEmail;
        if (!email) return res.redirect("/user/forgot-password");

        return res.render("user/verify-reset-otp", {
            title: "Verify Reset OTP",
            email
        });
    } catch (error) {
        console.error("Show verify reset OTP error:", error);
        return res.redirect("/user/forgot-password");
    }
};

exports.verifyResetOTP = async (req, res) => {
    try {
        const email = req.session.passwordResetEmail;
        const userId = req.session.passwordResetUserId;

        if (!email || !userId) {
            return res.redirect("/user/forgot-password");
        }

        const enteredOTP = String(req.body.otp || "").trim();

        if (!/^\d{6}$/.test(enteredOTP)) {
            return res.render("user/verify-reset-otp", {
                title: "Verify Reset OTP",
                email,
                error: "Please enter a valid 6-digit OTP."
            });
        }

        const user = await User.findOne({ _id: userId, email });
        if (!user) {
            return res.render("user/verify-reset-otp", {
                title: "Verify Reset OTP",
                email,
                error: "Invalid password reset request."
            });
        }

        if (!user.passwordResetOTP) {
            return res.render("user/verify-reset-otp", {
                title: "Verify Reset OTP",
                email,
                error: "OTP is not available. Please request a new OTP."
            });
        }

        if (isOTPExpired(user.passwordResetOTPExpires)) {
            user.passwordResetOTP = "";
            user.passwordResetOTPExpires = null;
            user.passwordResetVerified = false;
            await user.save();

            req.session.passwordResetVerified = false;

            return res.render("user/verify-reset-otp", {
                title: "Verify Reset OTP",
                email,
                error: "Your OTP has expired. Please request a new OTP."
            });
        }

        if (enteredOTP !== user.passwordResetOTP) {
            return res.render("user/verify-reset-otp", {
                title: "Verify Reset OTP",
                email,
                error: "Invalid OTP. Please check the OTP and try again."
            });
        }

        user.passwordResetVerified = true;
        await user.save();

        req.session.passwordResetVerified = true;
        return res.redirect("/user/reset-password");
    } catch (error) {
        console.error("Verify reset OTP error:", error);
        return res.render("user/verify-reset-otp", {
            title: "Verify Reset OTP",
            email: req.session.passwordResetEmail || "",
            error: "Something went wrong. Please try again."
        });
    }
};

exports.resendPasswordResetOTP = async (req, res) => {
    try {
        const email = req.session.passwordResetEmail;
        if (!email) return res.redirect("/user/forgot-password");

        const user = await User.findOne({ email, isActive: true });
        if (!user) return res.redirect("/user/forgot-password");

        const otp = generateOTP();
        const otpExpiry = getOTPExpiry();

        user.passwordResetOTP = otp;
        user.passwordResetOTPExpires = otpExpiry;
        user.passwordResetVerified = false;
        await user.save();

        req.session.passwordResetVerified = false;

        const emailResult = await sendOTPEmail(user.email, user.name, otp);

        console.log("\n=================================\nPASSWORD RESET OTP RESENT\nEmail:", user.email, "\nOTP:", otp, "\nExpires:", otpExpiry, "\n=================================\n");

        if (!emailResult || emailResult.success === false) {
            console.error("Password reset resend email failed.");
            return res.render("user/verify-reset-otp", {
                title: "Verify Reset OTP",
                email,
                error: "We could not send the OTP email. Please try again."
            });
        }

        return res.redirect("/user/verify-reset-otp");
    } catch (error) {
        console.error("Resend password reset OTP error:", error);
        return res.redirect("/user/verify-reset-otp");
    }
};

exports.showResetPassword = async (req, res) => {
    try {
        const userId = req.session.passwordResetUserId;
        const verified = req.session.passwordResetVerified;

        if (!userId || verified !== true) {
            return res.redirect("/user/forgot-password");
        }

        const user = await User.findById(userId);
        if (!user || user.passwordResetVerified !== true) {
            return res.redirect("/user/forgot-password");
        }

        return res.render("user/reset-password", {
            title: "Reset Password",
            email: user.email
        });
    } catch (error) {
        console.error("Show reset password error:", error);
        return res.redirect("/user/forgot-password");
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const userId = req.session.passwordResetUserId;
        const verified = req.session.passwordResetVerified;

        if (!userId || verified !== true) {
            return res.redirect("/user/forgot-password");
        }

        const password = String(req.body.password || "");
        const confirmPassword = String(req.body.confirmPassword || "");

        if (!password || !confirmPassword) {
            return res.render("user/reset-password", {
                title: "Reset Password",
                error: "Please enter your new password."
            });
        }

        if (password.length < 6) {
            return res.render("user/reset-password", {
                title: "Reset Password",
                error: "Password must be at least 6 characters long."
            });
        }

        if (password !== confirmPassword) {
            return res.render("user/reset-password", {
                title: "Reset Password",
                error: "Passwords do not match."
            });
        }

        const user = await User.findById(userId);
        if (!user || user.passwordResetVerified !== true) {
            return res.redirect("/user/forgot-password");
        }

        user.password = await bcrypt.hash(password, 12);
        user.passwordResetOTP = "";
        user.passwordResetOTPExpires = null;
        user.passwordResetVerified = false;
        await user.save();

        delete req.session.passwordResetEmail;
        delete req.session.passwordResetUserId;
        delete req.session.passwordResetVerified;

        return res.redirect("/user/login?passwordReset=success");
    } catch (error) {
        console.error("Reset password error:", error);
        return res.render("user/reset-password", {
            title: "Reset Password",
            error: "Something went wrong. Please try again."
        });
    }
};

exports.showChangePassword = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.redirect("/user/login?redirect=/user/change-password");
        }
        return res.render("user/change-password", { title: "Change Password" });
    } catch (error) {
        console.error("Show change password error:", error);
        return res.redirect("/user/login");
    }
};

exports.changePassword = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.redirect("/user/login?redirect=/user/change-password");
        }

        const currentPassword = String(req.body.currentPassword || "");
        const newPassword = String(req.body.newPassword || "");
        const confirmPassword = String(req.body.confirmPassword || "");

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.render("user/change-password", {
                title: "Change Password",
                error: "Please fill in all password fields."
            });
        }

        if (newPassword.length < 6) {
            return res.render("user/change-password", {
                title: "Change Password",
                error: "New password must be at least 6 characters long."
            });
        }

        if (newPassword !== confirmPassword) {
            return res.render("user/change-password", {
                title: "Change Password",
                error: "New passwords do not match."
            });
        }

        const user = await User.findById(req.session.userId);
        if (!user) {
            req.session.destroy(() => {});
            return res.redirect("/user/login");
        }

        const passwordMatch = await bcrypt.compare(currentPassword, user.password);
        if (!passwordMatch) {
            return res.render("user/change-password", {
                title: "Change Password",
                error: "Current password is incorrect."
            });
        }

        const samePassword = await bcrypt.compare(newPassword, user.password);
        if (samePassword) {
            return res.render("user/change-password", {
                title: "Change Password",
                error: "New password must be different from your current password."
            });
        }

        user.password = await bcrypt.hash(newPassword, 12);
        await user.save();

        return res.render("user/change-password", {
            title: "Change Password",
            success: "Your password has been changed successfully."
        });
    } catch (error) {
        console.error("Change password error:", error);
        return res.render("user/change-password", {
            title: "Change Password",
            error: "Something went wrong. Please try again."
        });
    }
};