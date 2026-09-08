const express = require("express");
const router = express.Router();
const passwordController = require("../controllers/passwordController");

// Forgot Password
router.get("/forgot-password", passwordController.showForgotPassword);
router.post("/forgot-password", passwordController.sendPasswordResetOTP);

// Verify Reset OTP
router.get("/verify-reset-otp", passwordController.showVerifyResetOTP);
router.post("/verify-reset-otp", passwordController.verifyResetOTP);
router.post("/resend-reset-otp", passwordController.resendPasswordResetOTP);

// Reset Password
router.get("/reset-password", passwordController.showResetPassword);
router.post("/reset-password", passwordController.resetPassword);

// Change Password
router.get("/change-password", passwordController.showChangePassword);
router.post("/change-password", passwordController.changePassword);

module.exports = router;