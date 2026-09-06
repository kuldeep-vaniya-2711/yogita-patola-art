const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const User = require("../models/User");

const {
    sendOTPEmail
} = require("../services/emailService");



/*
=========================================================
GENERATE OTP
=========================================================
*/

function generateOTP() {

    return crypto
        .randomInt(100000, 1000000)
        .toString();

}



/*
=========================================================
OTP EXPIRY
=========================================================
*/

function getOTPExpiry() {

    return new Date(
        Date.now() + 10 * 60 * 1000
    );

}



/*
=========================================================
CHECK OTP EXPIRY
=========================================================
*/

function isOTPExpired(expiry) {

    if (!expiry) {
        return true;
    }

    return new Date(expiry).getTime() < Date.now();

}



/*
=========================================================
FORGOT PASSWORD PAGE
=========================================================
*/

exports.showForgotPassword = (req, res) => {

    res.render(
        "user/forgot-password",
        {
            title: "Forgot Password"
        }
    );

};



/*
=========================================================
SEND PASSWORD RESET OTP
=========================================================
*/

exports.sendPasswordResetOTP = async (req, res) => {

    try {

        const email =
            String(req.body.email || "")
                .trim()
                .toLowerCase();


        /*
        -------------------------------------------------
        BASIC VALIDATION
        -------------------------------------------------
        */

        if (!email) {

            return res.render(
                "user/forgot-password",
                {
                    title: "Forgot Password",
                    error: "Please enter your email address.",
                    email
                }
            );

        }


        /*
        -------------------------------------------------
        FIND USER
        -------------------------------------------------
        */

        const user =
            await User.findOne({
                email
            });


        /*
        -------------------------------------------------
        DON'T REVEAL WHETHER ACCOUNT EXISTS
        -------------------------------------------------
        */

        if (!user || !user.isActive) {

            return res.render(
                "user/forgot-password",
                {
                    title: "Forgot Password",
                    success:
                        "If an account exists with this email, a password reset OTP has been sent.",
                    email
                }
            );

        }


        /*
        -------------------------------------------------
        GENERATE OTP
        -------------------------------------------------
        */

        const otp =
            generateOTP();

        const otpExpiry =
            getOTPExpiry();


        /*
        -------------------------------------------------
        SAVE OTP
        -------------------------------------------------
        */

        user.passwordResetOTP =
            otp;

        user.passwordResetOTPExpires =
            otpExpiry;

        user.passwordResetVerified =
            false;


        await user.save();


        /*
        -------------------------------------------------
        SAVE RESET SESSION
        -------------------------------------------------
        */

        req.session.passwordResetEmail =
            user.email;

        req.session.passwordResetUserId =
            user._id.toString();

        req.session.passwordResetVerified =
            false;


        /*
        -------------------------------------------------
        SEND OTP EMAIL
        -------------------------------------------------

        IMPORTANT:
        emailService.js expects:

        sendOTPEmail(
            recipientEmail,
            recipientName,
            otp
        )
        -------------------------------------------------
        */

        const emailResult =
            await sendOTPEmail(
                user.email,
                user.name,
                otp
            );


        /*
        -------------------------------------------------
        LOG OTP FOR LOCAL DEVELOPMENT
        -------------------------------------------------
        */

        console.log("");
        console.log("=================================");
        console.log("PASSWORD RESET OTP");
        console.log("Email:", user.email);
        console.log("OTP:", otp);
        console.log("Expires:", otpExpiry);
        console.log("=================================");
        console.log("");


        /*
        -------------------------------------------------
        EMAIL FAILURE
        -------------------------------------------------
        */

        if (
            !emailResult ||
            emailResult.success === false
        ) {

            console.error(
                "Password reset email could not be sent."
            );

            return res.render(
                "user/forgot-password",
                {
                    title: "Forgot Password",
                    error:
                        "We could not send the OTP email. Please try again.",
                    email
                }
            );

        }


        /*
        -------------------------------------------------
        SUCCESS
        -------------------------------------------------
        */

        return res.redirect(
            "/user/verify-reset-otp"
        );

    } catch (error) {

        console.error(
            "Password reset OTP error:",
            error
        );

        return res.render(
            "user/forgot-password",
            {
                title: "Forgot Password",
                error:
                    "Something went wrong. Please try again.",
                email:
                    req.body.email || ""
            }
        );

    }

};



/*
=========================================================
VERIFY RESET OTP PAGE
=========================================================
*/

exports.showVerifyResetOTP = async (req, res) => {

    try {

        const email =
            req.session.passwordResetEmail;


        if (!email) {

            return res.redirect(
                "/user/forgot-password"
            );

        }


        return res.render(
            "user/verify-reset-otp",
            {
                title: "Verify Reset OTP",
                email
            }
        );

    } catch (error) {

        console.error(
            "Show verify reset OTP error:",
            error
        );

        return res.redirect(
            "/user/forgot-password"
        );

    }

};



/*
=========================================================
VERIFY PASSWORD RESET OTP
=========================================================
*/

exports.verifyResetOTP = async (req, res) => {

    try {

        const email =
            req.session.passwordResetEmail;

        const userId =
            req.session.passwordResetUserId;


        /*
        -------------------------------------------------
        SESSION CHECK
        -------------------------------------------------
        */

        if (!email || !userId) {

            return res.redirect(
                "/user/forgot-password"
            );

        }


        const enteredOTP =
            String(req.body.otp || "")
                .trim();


        /*
        -------------------------------------------------
        OTP FORMAT
        -------------------------------------------------
        */

        if (!/^\d{6}$/.test(enteredOTP)) {

            return res.render(
                "user/verify-reset-otp",
                {
                    title: "Verify Reset OTP",
                    email,
                    error:
                        "Please enter a valid 6-digit OTP."
                }
            );

        }


        /*
        -------------------------------------------------
        FIND USER
        -------------------------------------------------
        */

        const user =
            await User.findOne({
                _id: userId,
                email
            });


        if (!user) {

            return res.render(
                "user/verify-reset-otp",
                {
                    title: "Verify Reset OTP",
                    email,
                    error:
                        "Invalid password reset request."
                }
            );

        }


        /*
        -------------------------------------------------
        OTP EXISTS
        -------------------------------------------------
        */

        if (!user.passwordResetOTP) {

            return res.render(
                "user/verify-reset-otp",
                {
                    title: "Verify Reset OTP",
                    email,
                    error:
                        "OTP is not available. Please request a new OTP."
                }
            );

        }


        /*
        -------------------------------------------------
        CHECK EXPIRY
        -------------------------------------------------
        */

        if (
            isOTPExpired(
                user.passwordResetOTPExpires
            )
        ) {

            user.passwordResetOTP =
                "";

            user.passwordResetOTPExpires =
                null;

            user.passwordResetVerified =
                false;

            await user.save();


            req.session.passwordResetVerified =
                false;


            return res.render(
                "user/verify-reset-otp",
                {
                    title: "Verify Reset OTP",
                    email,
                    error:
                        "Your OTP has expired. Please request a new OTP."
                }
            );

        }


        /*
        -------------------------------------------------
        CHECK OTP
        -------------------------------------------------
        */

        if (
            enteredOTP !==
            user.passwordResetOTP
        ) {

            return res.render(
                "user/verify-reset-otp",
                {
                    title: "Verify Reset OTP",
                    email,
                    error:
                        "Invalid OTP. Please check the OTP and try again."
                }
            );

        }


        /*
        -------------------------------------------------
        OTP VERIFIED
        -------------------------------------------------
        */

        user.passwordResetVerified =
            true;


        await user.save();


        req.session.passwordResetVerified =
            true;


        /*
        -------------------------------------------------
        REDIRECT TO RESET PASSWORD
        -------------------------------------------------
        */

        return res.redirect(
            "/user/reset-password"
        );

    } catch (error) {

        console.error(
            "Verify reset OTP error:",
            error
        );

        return res.render(
            "user/verify-reset-otp",
            {
                title: "Verify Reset OTP",
                email:
                    req.session.passwordResetEmail || "",
                error:
                    "Something went wrong. Please try again."
            }
        );

    }

};



/*
=========================================================
RESEND PASSWORD RESET OTP
=========================================================
*/

exports.resendPasswordResetOTP = async (req, res) => {

    try {

        const email =
            req.session.passwordResetEmail;


        /*
        -------------------------------------------------
        SESSION CHECK
        -------------------------------------------------
        */

        if (!email) {

            return res.redirect(
                "/user/forgot-password"
            );

        }


        /*
        -------------------------------------------------
        FIND USER
        -------------------------------------------------
        */

        const user =
            await User.findOne({
                email,
                isActive: true
            });


        if (!user) {

            return res.redirect(
                "/user/forgot-password"
            );

        }


        /*
        -------------------------------------------------
        GENERATE NEW OTP
        -------------------------------------------------
        */

        const otp =
            generateOTP();

        const otpExpiry =
            getOTPExpiry();


        user.passwordResetOTP =
            otp;

        user.passwordResetOTPExpires =
            otpExpiry;

        user.passwordResetVerified =
            false;


        await user.save();


        /*
        -------------------------------------------------
        RESET SESSION VERIFICATION
        -------------------------------------------------
        */

        req.session.passwordResetVerified =
            false;


        /*
        -------------------------------------------------
        SEND NEW OTP EMAIL
        -------------------------------------------------

        Correct order:

        email
        user.name
        otp
        -------------------------------------------------
        */

        const emailResult =
            await sendOTPEmail(
                user.email,
                user.name,
                otp
            );


        /*
        -------------------------------------------------
        LOCAL DEVELOPMENT LOG
        -------------------------------------------------
        */

        console.log("");
        console.log("=================================");
        console.log("PASSWORD RESET OTP RESENT");
        console.log("Email:", user.email);
        console.log("OTP:", otp);
        console.log("Expires:", otpExpiry);
        console.log("=================================");
        console.log("");


        /*
        -------------------------------------------------
        EMAIL FAILURE
        -------------------------------------------------
        */

        if (
            !emailResult ||
            emailResult.success === false
        ) {

            console.error(
                "Password reset resend email failed."
            );

            return res.render(
                "user/verify-reset-otp",
                {
                    title: "Verify Reset OTP",
                    email,
                    error:
                        "We could not send the OTP email. Please try again."
                }
            );

        }


        return res.redirect(
            "/user/verify-reset-otp"
        );

    } catch (error) {

        console.error(
            "Resend password reset OTP error:",
            error
        );

        return res.redirect(
            "/user/verify-reset-otp"
        );

    }

};



/*
=========================================================
RESET PASSWORD PAGE
=========================================================
*/

exports.showResetPassword = async (req, res) => {

    try {

        const userId =
            req.session.passwordResetUserId;

        const verified =
            req.session.passwordResetVerified;


        /*
        -------------------------------------------------
        SESSION SECURITY CHECK
        -------------------------------------------------
        */

        if (!userId || verified !== true) {

            return res.redirect(
                "/user/forgot-password"
            );

        }


        /*
        -------------------------------------------------
        FIND USER
        -------------------------------------------------
        */

        const user =
            await User.findById(userId);


        if (!user) {

            return res.redirect(
                "/user/forgot-password"
            );

        }


        /*
        -------------------------------------------------
        DATABASE SECURITY CHECK
        -------------------------------------------------
        */

        if (
            user.passwordResetVerified !== true
        ) {

            return res.redirect(
                "/user/forgot-password"
            );

        }


        return res.render(
            "user/reset-password",
            {
                title: "Reset Password",
                email: user.email
            }
        );

    } catch (error) {

        console.error(
            "Show reset password error:",
            error
        );

        return res.redirect(
            "/user/forgot-password"
        );

    }

};



/*
=========================================================
RESET PASSWORD
=========================================================
*/

exports.resetPassword = async (req, res) => {

    try {

        const userId =
            req.session.passwordResetUserId;

        const verified =
            req.session.passwordResetVerified;


        /*
        -------------------------------------------------
        SESSION SECURITY CHECK
        -------------------------------------------------
        */

        if (!userId || verified !== true) {

            return res.redirect(
                "/user/forgot-password"
            );

        }


        const password =
            String(req.body.password || "");

        const confirmPassword =
            String(
                req.body.confirmPassword || ""
            );


        /*
        -------------------------------------------------
        PASSWORD VALIDATION
        -------------------------------------------------
        */

        if (!password || !confirmPassword) {

            return res.render(
                "user/reset-password",
                {
                    title: "Reset Password",
                    error:
                        "Please enter your new password."
                }
            );

        }


        if (password.length < 6) {

            return res.render(
                "user/reset-password",
                {
                    title: "Reset Password",
                    error:
                        "Password must be at least 6 characters long."
                }
            );

        }


        if (
            password !==
            confirmPassword
        ) {

            return res.render(
                "user/reset-password",
                {
                    title: "Reset Password",
                    error:
                        "Passwords do not match."
                }
            );

        }


        /*
        -------------------------------------------------
        FIND USER
        -------------------------------------------------
        */

        const user =
            await User.findById(userId);


        if (!user) {

            return res.redirect(
                "/user/forgot-password"
            );

        }


        /*
        -------------------------------------------------
        DATABASE SECURITY CHECK
        -------------------------------------------------
        */

        if (
            user.passwordResetVerified !== true
        ) {

            return res.redirect(
                "/user/forgot-password"
            );

        }


        /*
        -------------------------------------------------
        HASH NEW PASSWORD
        -------------------------------------------------
        */

        const hashedPassword =
            await bcrypt.hash(
                password,
                12
            );


        user.password =
            hashedPassword;


        /*
        -------------------------------------------------
        CLEAR PASSWORD RESET DATA
        -------------------------------------------------
        */

        user.passwordResetOTP =
            "";

        user.passwordResetOTPExpires =
            null;

        user.passwordResetVerified =
            false;


        await user.save();


        /*
        -------------------------------------------------
        CLEAR RESET SESSION
        -------------------------------------------------
        */

        delete req.session.passwordResetEmail;

        delete req.session.passwordResetUserId;

        delete req.session.passwordResetVerified;


        /*
        -------------------------------------------------
        SUCCESS
        -------------------------------------------------
        */

        return res.redirect(
            "/user/login?passwordReset=success"
        );

    } catch (error) {

        console.error(
            "Reset password error:",
            error
        );

        return res.render(
            "user/reset-password",
            {
                title: "Reset Password",
                error:
                    "Something went wrong. Please try again."
            }
        );

    }

};



/*
=========================================================
CHANGE PASSWORD PAGE
=========================================================
*/

exports.showChangePassword = async (req, res) => {

    try {

        /*
        -------------------------------------------------
        LOGIN CHECK
        -------------------------------------------------
        */

        if (!req.session.userId) {

            return res.redirect(
                "/user/login?redirect=/user/change-password"
            );

        }


        return res.render(
            "user/change-password",
            {
                title: "Change Password"
            }
        );

    } catch (error) {

        console.error(
            "Show change password error:",
            error
        );

        return res.redirect(
            "/user/login"
        );

    }

};



/*
=========================================================
CHANGE PASSWORD
=========================================================
*/

exports.changePassword = async (req, res) => {

    try {

        /*
        -------------------------------------------------
        LOGIN CHECK
        -------------------------------------------------
        */

        if (!req.session.userId) {

            return res.redirect(
                "/user/login?redirect=/user/change-password"
            );

        }


        const currentPassword =
            String(
                req.body.currentPassword || ""
            );

        const newPassword =
            String(
                req.body.newPassword || ""
            );

        const confirmPassword =
            String(
                req.body.confirmPassword || ""
            );


        /*
        -------------------------------------------------
        BASIC VALIDATION
        -------------------------------------------------
        */

        if (
            !currentPassword ||
            !newPassword ||
            !confirmPassword
        ) {

            return res.render(
                "user/change-password",
                {
                    title: "Change Password",
                    error:
                        "Please fill in all password fields."
                }
            );

        }


        /*
        -------------------------------------------------
        MINIMUM PASSWORD LENGTH
        -------------------------------------------------
        */

        if (newPassword.length < 6) {

            return res.render(
                "user/change-password",
                {
                    title: "Change Password",
                    error:
                        "New password must be at least 6 characters long."
                }
            );

        }


        /*
        -------------------------------------------------
        CONFIRM PASSWORD
        -------------------------------------------------
        */

        if (
            newPassword !==
            confirmPassword
        ) {

            return res.render(
                "user/change-password",
                {
                    title: "Change Password",
                    error:
                        "New passwords do not match."
                }
            );

        }


        /*
        -------------------------------------------------
        FIND LOGGED-IN USER
        -------------------------------------------------
        */

        const user =
            await User.findById(
                req.session.userId
            );


        if (!user) {

            req.session.destroy(() => {});

            return res.redirect(
                "/user/login"
            );

        }


        /*
        -------------------------------------------------
        CHECK CURRENT PASSWORD
        -------------------------------------------------
        */

        const passwordMatch =
            await bcrypt.compare(
                currentPassword,
                user.password
            );


        if (!passwordMatch) {

            return res.render(
                "user/change-password",
                {
                    title: "Change Password",
                    error:
                        "Current password is incorrect."
                }
            );

        }


        /*
        -------------------------------------------------
        PREVENT SAME PASSWORD
        -------------------------------------------------
        */

        const samePassword =
            await bcrypt.compare(
                newPassword,
                user.password
            );


        if (samePassword) {

            return res.render(
                "user/change-password",
                {
                    title: "Change Password",
                    error:
                        "New password must be different from your current password."
                }
            );

        }


        /*
        -------------------------------------------------
        HASH NEW PASSWORD
        -------------------------------------------------
        */

        user.password =
            await bcrypt.hash(
                newPassword,
                12
            );


        await user.save();


        /*
        -------------------------------------------------
        SUCCESS
        -------------------------------------------------
        */

        return res.render(
            "user/change-password",
            {
                title: "Change Password",
                success:
                    "Your password has been changed successfully."
            }
        );

    } catch (error) {

        console.error(
            "Change password error:",
            error
        );

        return res.render(
            "user/change-password",
            {
                title: "Change Password",
                error:
                    "Something went wrong. Please try again."
            }
        );

    }

};