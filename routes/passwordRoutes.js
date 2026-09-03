const express = require("express");

const router = express.Router();

const passwordController = require("../controllers/passwordController");


// =========================================================
// FORGOT PASSWORD
// =========================================================

// Show Forgot Password page
router.get(
  "/forgot-password",
  passwordController.showForgotPassword
);


// Send Password Reset OTP
router.post(
  "/forgot-password",
  passwordController.sendPasswordResetOTP
);


// =========================================================
// VERIFY PASSWORD RESET OTP
// =========================================================

// Show OTP verification page
router.get(
  "/verify-reset-otp",
  passwordController.showVerifyResetOTP
);


// Verify OTP
router.post(
  "/verify-reset-otp",
  passwordController.verifyResetOTP
);


// Resend OTP
router.post(
  "/resend-reset-otp",
  passwordController.resendPasswordResetOTP
);


// =========================================================
// RESET PASSWORD
// =========================================================

// Show Reset Password page
router.get(
  "/reset-password",
  passwordController.showResetPassword
);


// Save New Password
router.post(
  "/reset-password",
  passwordController.resetPassword
);


// =========================================================
// CHANGE PASSWORD
// =========================================================

// Show Change Password page
router.get(
  "/change-password",
  passwordController.showChangePassword
);


// Change Password
router.post(
  "/change-password",
  passwordController.changePassword
);


// =========================================================
// EXPORT
// =========================================================

module.exports = router;