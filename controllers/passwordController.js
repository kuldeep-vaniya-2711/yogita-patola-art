const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const User = require("../models/User");
const { sendOTPEmail } = require("../services/emailService");


// =========================================================
// HELPER FUNCTIONS
// =========================================================

function generateOTP() {
  return crypto.randomInt(100000, 1000000).toString();
}


function getOTPExpiry() {
  // OTP valid for 10 minutes
  return new Date(Date.now() + 10 * 60 * 1000);
}


function isOTPExpired(expiry) {
  if (!expiry) {
    return true;
  }

  return new Date(expiry).getTime() < Date.now();
}


// =========================================================
// FORGOT PASSWORD - SHOW PAGE
// GET /user/forgot-password
// =========================================================

exports.showForgotPassword = (req, res) => {
  return res.render("user/forgot-password", {
    title: "Forgot Password",
    error: null,
    success: null,
    email: ""
  });
};


// =========================================================
// FORGOT PASSWORD - SEND OTP
// POST /user/forgot-password
// =========================================================

exports.sendPasswordResetOTP = async (req, res) => {
  try {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();


    // -----------------------------------------------------
    // Basic validation
    // -----------------------------------------------------

    if (!email) {
      return res.status(400).render("user/forgot-password", {
        title: "Forgot Password",
        error: "Please enter your email address.",
        success: null,
        email: ""
      });
    }


    // -----------------------------------------------------
    // Find user
    // -----------------------------------------------------

    const user = await User.findOne({ email });


    /*
     * IMPORTANT SECURITY:
     *
     * We don't tell the user whether the email exists.
     *
     * This prevents user-account enumeration.
     */

    if (!user) {
      return res.render("user/forgot-password", {
        title: "Forgot Password",
        error: null,
        success:
          "If an account exists with this email, a password reset OTP has been sent.",
        email
      });
    }


    // -----------------------------------------------------
    // Check account status
    // -----------------------------------------------------

    if (user.isActive === false) {
      return res.render("user/forgot-password", {
        title: "Forgot Password",
        error: null,
        success:
          "If an account exists with this email, a password reset OTP has been sent.",
        email
      });
    }


    // -----------------------------------------------------
    // Generate password reset OTP
    // -----------------------------------------------------

    const otp = generateOTP();
    const otpExpires = getOTPExpiry();


    // -----------------------------------------------------
    // Save reset OTP in database
    // -----------------------------------------------------

    user.passwordResetOTP = otp;
    user.passwordResetOTPExpires = otpExpires;
    user.passwordResetVerified = false;

    await user.save();


    // -----------------------------------------------------
    // Save reset information in session
    // -----------------------------------------------------

    req.session.passwordResetEmail = email;
    req.session.passwordResetUserId = user._id.toString();
    req.session.passwordResetVerified = false;


    // -----------------------------------------------------
    // Send OTP email
    // -----------------------------------------------------

    await sendOTPEmail(
      email,
      otp,
      "Password Reset OTP"
    );


    console.log(
      `Password reset OTP generated for ${email}: ${otp}`
    );


    // -----------------------------------------------------
    // Redirect to OTP verification page
    // -----------------------------------------------------

    return res.redirect("/user/verify-reset-otp");

  } catch (error) {

    console.error(
      "Forgot password error:",
      error
    );


    return res.status(500).render("user/forgot-password", {
      title: "Forgot Password",
      error:
        "Something went wrong while sending the OTP. Please try again.",
      success: null,
      email: String(req.body.email || "")
        .trim()
        .toLowerCase()
    });
  }
};


// =========================================================
// VERIFY RESET OTP - SHOW PAGE
// GET /user/verify-reset-otp
// =========================================================

exports.showVerifyResetOTP = (req, res) => {

  const email = req.session.passwordResetEmail;


  if (!email) {
    return res.redirect("/user/forgot-password");
  }


  return res.render("user/verify-reset-otp", {
    title: "Verify Reset OTP",
    error: null,
    success: null,
    email,
    otp: ""
  });
};


// =========================================================
// VERIFY RESET OTP
// POST /user/verify-reset-otp
// =========================================================

exports.verifyResetOTP = async (req, res) => {
  try {

    const email = req.session.passwordResetEmail;
    const userId = req.session.passwordResetUserId;


    // -----------------------------------------------------
    // Check reset session
    // -----------------------------------------------------

    if (!email || !userId) {
      return res.redirect("/user/forgot-password");
    }


    const otp = String(req.body.otp || "")
      .trim();


    // -----------------------------------------------------
    // Validate OTP format
    // -----------------------------------------------------

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).render("user/verify-reset-otp", {
        title: "Verify Reset OTP",
        error: "Please enter a valid 6-digit OTP.",
        success: null,
        email,
        otp
      });
    }


    // -----------------------------------------------------
    // Find user
    // -----------------------------------------------------

    const user = await User.findById(userId);


    if (!user || user.email !== email) {
      return res.redirect("/user/forgot-password");
    }


    // -----------------------------------------------------
    // Check OTP exists
    // -----------------------------------------------------

    if (!user.passwordResetOTP) {
      return res.status(400).render("user/verify-reset-otp", {
        title: "Verify Reset OTP",
        error:
          "This OTP is no longer available. Please request a new OTP.",
        success: null,
        email,
        otp: ""
      });
    }


    // -----------------------------------------------------
    // Check OTP expiry
    // -----------------------------------------------------

    if (isOTPExpired(user.passwordResetOTPExpires)) {

      user.passwordResetOTP = "";
      user.passwordResetOTPExpires = null;
      user.passwordResetVerified = false;

      await user.save();


      req.session.passwordResetVerified = false;


      return res.status(400).render("user/verify-reset-otp", {
        title: "Verify Reset OTP",
        error:
          "Your OTP has expired. Please request a new OTP.",
        success: null,
        email,
        otp: ""
      });
    }


    // -----------------------------------------------------
    // Check OTP
    // -----------------------------------------------------

    if (user.passwordResetOTP !== otp) {
      return res.status(400).render("user/verify-reset-otp", {
        title: "Verify Reset OTP",
        error: "Incorrect OTP. Please try again.",
        success: null,
        email,
        otp: ""
      });
    }


    // -----------------------------------------------------
    // OTP verified successfully
    // -----------------------------------------------------

    user.passwordResetVerified = true;

    await user.save();


    // -----------------------------------------------------
    // Update session
    // -----------------------------------------------------

    req.session.passwordResetVerified = true;


    console.log(
      `Password reset OTP verified for ${email}`
    );


    // -----------------------------------------------------
    // Go to reset password page
    // -----------------------------------------------------

    return res.redirect("/user/reset-password");

  } catch (error) {

    console.error(
      "Verify reset OTP error:",
      error
    );


    return res.status(500).render("user/verify-reset-otp", {
      title: "Verify Reset OTP",
      error:
        "Something went wrong while verifying the OTP. Please try again.",
      success: null,
      email: req.session.passwordResetEmail || "",
      otp: ""
    });
  }
};


// =========================================================
// RESEND RESET OTP
// POST /user/resend-reset-otp
// =========================================================

exports.resendPasswordResetOTP = async (req, res) => {
  try {

    const email = req.session.passwordResetEmail;


    if (!email) {
      return res.redirect("/user/forgot-password");
    }


    // -----------------------------------------------------
    // Find user
    // -----------------------------------------------------

    const user = await User.findOne({ email });


    /*
     * Again, don't expose whether the account exists.
     */

    if (!user || user.isActive === false) {
      return res.redirect("/user/verify-reset-otp");
    }


    // -----------------------------------------------------
    // Generate new OTP
    // -----------------------------------------------------

    const otp = generateOTP();
    const otpExpires = getOTPExpiry();


    // -----------------------------------------------------
    // Save new OTP
    // -----------------------------------------------------

    user.passwordResetOTP = otp;
    user.passwordResetOTPExpires = otpExpires;
    user.passwordResetVerified = false;

    await user.save();


    // -----------------------------------------------------
    // Update session
    // -----------------------------------------------------

    req.session.passwordResetVerified = false;


    // -----------------------------------------------------
    // Send new OTP
    // -----------------------------------------------------

    await sendOTPEmail(
      email,
      otp,
      "Password Reset OTP"
    );


    console.log(
      `Password reset OTP resent for ${email}: ${otp}`
    );


    return res.redirect("/user/verify-reset-otp");

  } catch (error) {

    console.error(
      "Resend password reset OTP error:",
      error
    );


    return res.status(500).render("user/verify-reset-otp", {
      title: "Verify Reset OTP",
      error:
        "Unable to resend OTP right now. Please try again.",
      success: null,
      email: req.session.passwordResetEmail || "",
      otp: ""
    });
  }
};


// =========================================================
// RESET PASSWORD - SHOW PAGE
// GET /user/reset-password
// =========================================================

exports.showResetPassword = async (req, res) => {
  try {

    const userId = req.session.passwordResetUserId;
    const verified = req.session.passwordResetVerified;


    // -----------------------------------------------------
    // OTP must be verified first
    // -----------------------------------------------------

    if (!userId || verified !== true) {
      return res.redirect("/user/forgot-password");
    }


    const user = await User.findById(userId);


    if (!user) {
      return res.redirect("/user/forgot-password");
    }


    // -----------------------------------------------------
    // Double-check database verification
    // -----------------------------------------------------

    if (user.passwordResetVerified !== true) {
      return res.redirect("/user/verify-reset-otp");
    }


    return res.render("user/reset-password", {
      title: "Reset Password",
      error: null,
      success: null
    });

  } catch (error) {

    console.error(
      "Show reset password error:",
      error
    );


    return res.redirect("/user/forgot-password");
  }
};


// =========================================================
// RESET PASSWORD
// POST /user/reset-password
// =========================================================

exports.resetPassword = async (req, res) => {
  try {

    const userId = req.session.passwordResetUserId;
    const verified = req.session.passwordResetVerified;


    // -----------------------------------------------------
    // Security check
    // -----------------------------------------------------

    if (!userId || verified !== true) {
      return res.redirect("/user/forgot-password");
    }


    const password = String(req.body.password || "");
    const confirmPassword = String(
      req.body.confirmPassword || ""
    );


    // -----------------------------------------------------
    // Password validation
    // -----------------------------------------------------

    if (!password || !confirmPassword) {
      return res.status(400).render("user/reset-password", {
        title: "Reset Password",
        error: "Please enter both password fields.",
        success: null
      });
    }


    if (password.length < 6) {
      return res.status(400).render("user/reset-password", {
        title: "Reset Password",
        error:
          "Password must be at least 6 characters long.",
        success: null
      });
    }


    if (password !== confirmPassword) {
      return res.status(400).render("user/reset-password", {
        title: "Reset Password",
        error: "Passwords do not match.",
        success: null
      });
    }


    // -----------------------------------------------------
    // Find user
    // -----------------------------------------------------

    const user = await User.findById(userId);


    if (!user) {
      return res.redirect("/user/forgot-password");
    }


    // -----------------------------------------------------
    // Verify database reset authorization
    // -----------------------------------------------------

    if (user.passwordResetVerified !== true) {
      return res.redirect("/user/verify-reset-otp");
    }


    // -----------------------------------------------------
    // Hash new password
    // -----------------------------------------------------

    const hashedPassword = await bcrypt.hash(
      password,
      12
    );


    user.password = hashedPassword;


    // -----------------------------------------------------
    // Clear reset OTP data
    // -----------------------------------------------------

    user.passwordResetOTP = "";
    user.passwordResetOTPExpires = null;
    user.passwordResetVerified = false;


    await user.save();


    // -----------------------------------------------------
    // Clear password reset session
    // -----------------------------------------------------

    delete req.session.passwordResetEmail;
    delete req.session.passwordResetUserId;
    delete req.session.passwordResetVerified;


    console.log(
      `Password successfully reset for ${user.email}`
    );


    // -----------------------------------------------------
    // Redirect to login
    // -----------------------------------------------------

    return res.redirect(
      "/user/login?passwordReset=success"
    );

  } catch (error) {

    console.error(
      "Reset password error:",
      error
    );


    return res.status(500).render("user/reset-password", {
      title: "Reset Password",
      error:
        "Something went wrong while resetting your password. Please try again.",
      success: null
    });
  }
};


// =========================================================
// CHANGE PASSWORD - SHOW PAGE
// Logged-in user only
// GET /user/change-password
// =========================================================

exports.showChangePassword = (req, res) => {

  if (!req.session.userId) {
    return res.redirect(
      "/user/login?redirect=/user/change-password"
    );
  }


  return res.render("user/change-password", {
    title: "Change Password",
    error: null,
    success: null
  });
};


// =========================================================
// CHANGE PASSWORD
// Logged-in user only
// POST /user/change-password
// =========================================================

exports.changePassword = async (req, res) => {
  try {

    // -----------------------------------------------------
    // Check login
    // -----------------------------------------------------

    if (!req.session.userId) {
      return res.redirect(
        "/user/login?redirect=/user/change-password"
      );
    }


    const currentPassword = String(
      req.body.currentPassword || ""
    );

    const newPassword = String(
      req.body.newPassword || ""
    );

    const confirmPassword = String(
      req.body.confirmPassword || ""
    );


    // -----------------------------------------------------
    // Validate fields
    // -----------------------------------------------------

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).render(
        "user/change-password",
        {
          title: "Change Password",
          error:
            "Please fill in all password fields.",
          success: null
        }
      );
    }


    // -----------------------------------------------------
    // Password length
    // -----------------------------------------------------

    if (newPassword.length < 6) {
      return res.status(400).render(
        "user/change-password",
        {
          title: "Change Password",
          error:
            "New password must be at least 6 characters long.",
          success: null
        }
      );
    }


    // -----------------------------------------------------
    // Confirm password
    // -----------------------------------------------------

    if (newPassword !== confirmPassword) {
      return res.status(400).render(
        "user/change-password",
        {
          title: "Change Password",
          error:
            "New passwords do not match.",
          success: null
        }
      );
    }


    // -----------------------------------------------------
    // Find logged-in user
    // -----------------------------------------------------

    const user = await User.findById(
      req.session.userId
    );


    if (!user) {
      req.session.destroy(() => {});

      return res.redirect("/user/login");
    }


    // -----------------------------------------------------
    // Verify current password
    // -----------------------------------------------------

    const passwordMatches =
      await bcrypt.compare(
        currentPassword,
        user.password
      );


    if (!passwordMatches) {
      return res.status(400).render(
        "user/change-password",
        {
          title: "Change Password",
          error:
            "Your current password is incorrect.",
          success: null
        }
      );
    }


    // -----------------------------------------------------
    // Prevent same password
    // -----------------------------------------------------

    const samePassword =
      await bcrypt.compare(
        newPassword,
        user.password
      );


    if (samePassword) {
      return res.status(400).render(
        "user/change-password",
        {
          title: "Change Password",
          error:
            "New password must be different from your current password.",
          success: null
        }
      );
    }


    // -----------------------------------------------------
    // Hash new password
    // -----------------------------------------------------

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        12
      );


    user.password = hashedPassword;

    await user.save();


    console.log(
      `Password changed successfully for ${user.email}`
    );


    // -----------------------------------------------------
    // Success
    // -----------------------------------------------------

    return res.render(
      "user/change-password",
      {
        title: "Change Password",
        error: null,
        success:
          "Your password has been changed successfully."
      }
    );

  } catch (error) {

    console.error(
      "Change password error:",
      error
    );


    return res.status(500).render(
      "user/change-password",
      {
        title: "Change Password",
        error:
          "Something went wrong while changing your password.",
        success: null
      }
    );
  }
};