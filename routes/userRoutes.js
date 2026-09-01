const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const router = express.Router();


// ==================================================
// MODEL
// ==================================================

const User = require("../models/User");


// ==================================================
// EMAIL SERVICE
// ==================================================

const { sendOTPEmail } = require("../services/emailService");


// ==================================================
// SAFE REDIRECT
// ==================================================

function getSafeRedirect(value) {

    if (!value) {
        return "/";
    }

    let redirectUrl;

    try {
        redirectUrl = decodeURIComponent(value);
    } catch (error) {
        redirectUrl = value;
    }

    if (
        typeof redirectUrl !== "string" ||
        !redirectUrl.startsWith("/") ||
        redirectUrl.startsWith("//")
    ) {
        return "/";
    }

    return redirectUrl;
}


// ==================================================
// GENERATE OTP
// ==================================================

function generateOTP() {

    return crypto
        .randomInt(100000, 1000000)
        .toString();

}


// ==================================================
// OTP EXPIRY
// ==================================================

function getOTPExpiry() {

    return new Date(
        Date.now() + 10 * 60 * 1000
    );

}


// ==================================================
// SAVE OTP IN SESSION
// ==================================================

function saveOTPInSession(
    req,
    user,
    otp,
    otpExpires
) {

    if (!req.session) {
        return;
    }

    req.session.emailVerificationUserId =
        user._id.toString();

    req.session.emailVerificationEmail =
        user.email;

    req.session.emailVerificationOTP =
        otp;

    req.session.emailVerificationOTPExpires =
        otpExpires.getTime();

}


// ==================================================
// CLEAR VERIFICATION SESSION
// ==================================================

function clearVerificationSession(req) {

    if (!req.session) {
        return;
    }

    delete req.session.emailVerificationUserId;
    delete req.session.emailVerificationEmail;
    delete req.session.emailVerificationOTP;
    delete req.session.emailVerificationOTPExpires;

}


// ==================================================
// OTP EXPIRY CHECK
// ==================================================

function isOTPExpired(otpExpires) {

    if (!otpExpires) {
        return true;
    }

    const expiryTime =
        otpExpires instanceof Date
            ? otpExpires.getTime()
            : new Date(otpExpires).getTime();

    if (Number.isNaN(expiryTime)) {
        return true;
    }

    return expiryTime <= Date.now();

}


// ==================================================
// REGISTER ERROR
// ==================================================

function renderRegisterError(
    res,
    message
) {

    return res.render(
        "user/register",
        {
            title: "Create Account | Yogita Patola Art",
            description:
                "Create your Yogita Patola Art account.",
            error: message,
            success: null,
            pageCss: "/css/pages/register.css",
            pageJs: "/js/pages/register.js"
        }
    );

}


// ==================================================
// LOGIN ERROR
// ==================================================

function renderLoginError(
    res,
    message,
    redirect
) {

    const safeRedirect =
        getSafeRedirect(redirect);

    return res.render(
        "user/login",
        {
            title: "Login | Yogita Patola Art",
            description:
                "Login to your Yogita Patola Art account.",
            error: message,
            success: null,
            redirect: safeRedirect,
            redirectUrl: safeRedirect,
            pageCss: "/css/pages/login.css"
        }
    );

}


// ==================================================
// VERIFICATION PAGE
// ==================================================

function renderVerificationPage(
    res,
    email,
    error = null,
    success = null
) {

    return res.render(
        "user/verify-email",
        {
            title: "Verify Email | Yogita Patola Art",
            email,
            error,
            success
        }
    );

}


// ==================================================
// REGISTER PAGE
// ==================================================

router.get(
    "/register",
    (req, res) => {

        try {

            if (req.session?.userId) {
                return res.redirect("/");
            }

            return res.render(
                "user/register",
                {
                    title:
                        "Create Account | Yogita Patola Art",

                    description:
                        "Create your Yogita Patola Art account.",

                    error: null,

                    success: null,

                    pageCss:
                        "/css/pages/register.css",

                    pageJs:
                        "/js/pages/register.js"
                }
            );

        } catch (error) {

            console.error(
                "Register page error:",
                error
            );

            return res
                .status(500)
                .send(
                    "Unable to open registration page."
                );

        }

    }
);


// ==================================================
// REGISTER USER
// ==================================================

router.post(
    "/register",
    async (req, res) => {

        try {

            const {
                name,
                email,
                phone,
                password,
                confirmPassword
            } = req.body;


            // ------------------------------------------
            // CLEAN DATA
            // ------------------------------------------

            const cleanName =
                typeof name === "string"
                    ? name.trim()
                    : "";

            const cleanEmail =
                typeof email === "string"
                    ? email.trim().toLowerCase()
                    : "";

            const cleanPhone =
                typeof phone === "string"
                    ? phone.trim()
                    : "";


            // ------------------------------------------
            // REQUIRED FIELDS
            // ------------------------------------------

            if (
                !cleanName ||
                !cleanEmail ||
                !password ||
                !confirmPassword
            ) {

                return renderRegisterError(
                    res,
                    "Please fill all required fields."
                );

            }


            // ------------------------------------------
            // NAME VALIDATION
            // ------------------------------------------

            if (
                cleanName.length < 2 ||
                cleanName.length > 50
            ) {

                return renderRegisterError(
                    res,
                    "Name must be between 2 and 50 characters."
                );

            }


            // ------------------------------------------
            // EMAIL VALIDATION
            // ------------------------------------------

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (
                !emailPattern.test(cleanEmail)
            ) {

                return renderRegisterError(
                    res,
                    "Please enter a valid email address."
                );

            }


            // ------------------------------------------
            // PASSWORD VALIDATION
            // ------------------------------------------

            if (
                typeof password !== "string" ||
                password.length < 6
            ) {

                return renderRegisterError(
                    res,
                    "Password must be at least 6 characters."
                );

            }


            // ------------------------------------------
            // CONFIRM PASSWORD
            // ------------------------------------------

            if (
                password !== confirmPassword
            ) {

                return renderRegisterError(
                    res,
                    "Passwords do not match."
                );

            }


            // ------------------------------------------
            // CHECK EXISTING USER
            // ------------------------------------------

            const existingUser =
                await User.findOne({
                    email: cleanEmail
                });


            if (existingUser) {

                if (!existingUser.emailVerified) {

                    return renderRegisterError(
                        res,
                        "This email is already registered but not verified. Please login or use Resend OTP."
                    );

                }

                return renderRegisterError(
                    res,
                    "This email is already registered. Please login."
                );

            }


            // ------------------------------------------
            // HASH PASSWORD
            // ------------------------------------------

            const hashedPassword =
                await bcrypt.hash(
                    password,
                    12
                );


            // ------------------------------------------
            // GENERATE OTP
            // ------------------------------------------

            const otp =
                generateOTP();

            const otpExpires =
                getOTPExpiry();


            // ------------------------------------------
            // CREATE USER
            // ------------------------------------------

            const user =
                new User({

                    name:
                        cleanName,

                    email:
                        cleanEmail,

                    phone:
                        cleanPhone,

                    password:
                        hashedPassword,

                    phoneVerified:
                        false,

                    emailVerified:
                        false,

                    emailOTP:
                        otp,

                    emailOTPExpires:
                        otpExpires,

                    isActive:
                        true

                });


            await user.save();


            // ------------------------------------------
            // SAVE OTP SESSION
            // ------------------------------------------

            saveOTPInSession(
                req,
                user,
                otp,
                otpExpires
            );


            // ------------------------------------------
            // DEVELOPMENT OTP LOG
            // ------------------------------------------

            if (
                process.env.NODE_ENV !== "production"
            ) {

                console.log(
                    "================================"
                );

                console.log(
                    "REGISTRATION OTP"
                );

                console.log(
                    "Email:",
                    user.email
                );

                console.log(
                    "OTP:",
                    otp
                );

                console.log(
                    "Expires:",
                    otpExpires
                );

                console.log(
                    "================================"
                );

            }


            // ------------------------------------------
            // SEND OTP EMAIL
            // ------------------------------------------

            const emailResult =
                await sendOTPEmail(
                    user.email,
                    user.name,
                    otp
                );


            if (
                !emailResult ||
                !emailResult.success
            ) {

                console.error(
                    "Registration OTP email failed:",
                    emailResult?.error
                );

            }


            // ------------------------------------------
            // SAVE SESSION
            // ------------------------------------------

            req.session.save(
                (sessionError) => {

                    if (sessionError) {

                        console.error(
                            "Registration session save error:",
                            sessionError
                        );

                        return res
                            .status(500)
                            .send(
                                "Unable to continue registration."
                            );

                    }

                    return res.redirect(
                        "/user/verify-email"
                    );

                }
            );

        } catch (error) {

            console.error(
                "Registration error:",
                error
            );


            if (error.code === 11000) {

                return renderRegisterError(
                    res,
                    "This email is already registered. Please login."
                );

            }


            return renderRegisterError(
                res,
                "Unable to create account. Please try again."
            );

        }

    }
);


// ==================================================
// VERIFY EMAIL PAGE
// ==================================================

router.get(
    "/verify-email",
    async (req, res) => {

        try {

            const userId =
                req.session?.emailVerificationUserId;


            if (!userId) {

                return res.redirect(
                    "/user/register"
                );

            }


            const user =
                await User.findById(
                    userId
                );


            if (!user) {

                clearVerificationSession(req);

                return res.redirect(
                    "/user/register"
                );

            }


            if (user.emailVerified) {

                clearVerificationSession(req);

                return res.redirect(
                    "/user/login?verified=true"
                );

            }


            return renderVerificationPage(
                res,
                user.email
            );

        } catch (error) {

            console.error(
                "Verify email page error:",
                error
            );

            return res
                .status(500)
                .send(
                    "Unable to open email verification page."
                );

        }

    }
);


// ==================================================
// VERIFY EMAIL OTP
// ==================================================

router.post(
    "/verify-email",
    async (req, res) => {

        try {

            const enteredOTP =
                typeof req.body.otp === "string"
                    ? req.body.otp.trim()
                    : "";


            const userId =
                req.session?.emailVerificationUserId;


            if (!userId) {

                return res.redirect(
                    "/user/register"
                );

            }


            const user =
                await User.findById(
                    userId
                );


            if (!user) {

                clearVerificationSession(req);

                return res.redirect(
                    "/user/register"
                );

            }


            if (user.emailVerified) {

                clearVerificationSession(req);

                return res.redirect(
                    "/user/login?verified=true"
                );

            }


            // ------------------------------------------
            // OTP FORMAT
            // ------------------------------------------

            if (
                !/^\d{6}$/.test(enteredOTP)
            ) {

                return renderVerificationPage(
                    res,
                    user.email,
                    "OTP must contain exactly 6 digits."
                );

            }


            // ------------------------------------------
            // DATABASE OTP
            // ------------------------------------------

            const databaseOTP =
                user.emailOTP
                    ? String(
                        user.emailOTP
                    ).trim()
                    : "";


            // ------------------------------------------
            // SESSION OTP
            // ------------------------------------------

            const sessionOTP =
                req.session.emailVerificationOTP
                    ? String(
                        req.session.emailVerificationOTP
                    ).trim()
                    : "";


            let validOTP = "";
            let validOTPExpires = null;


            // ------------------------------------------
            // DATABASE OTP FIRST
            // ------------------------------------------

            if (databaseOTP) {

                validOTP =
                    databaseOTP;

                validOTPExpires =
                    user.emailOTPExpires;

            } else if (sessionOTP) {

                validOTP =
                    sessionOTP;

                validOTPExpires =
                    req.session
                        .emailVerificationOTPExpires
                        ? new Date(
                            req.session
                                .emailVerificationOTPExpires
                        )
                        : null;

            }


            // ------------------------------------------
            // OTP MISSING
            // ------------------------------------------

            if (!validOTP) {

                return renderVerificationPage(
                    res,
                    user.email,
                    "OTP is not available. Please click Resend OTP."
                );

            }


            // ------------------------------------------
            // OTP EXPIRED
            // ------------------------------------------

            if (
                isOTPExpired(
                    validOTPExpires
                )
            ) {

                return renderVerificationPage(
                    res,
                    user.email,
                    "OTP has expired. Please click Resend OTP."
                );

            }


            // ------------------------------------------
            // OTP MATCH
            // ------------------------------------------

            if (
                enteredOTP !== validOTP
            ) {

                return renderVerificationPage(
                    res,
                    user.email,
                    "Invalid OTP. Please enter the correct OTP."
                );

            }


            // ------------------------------------------
            // VERIFY USER
            // ------------------------------------------

            user.emailVerified = true;

            user.emailOTP = "";

            user.emailOTPExpires = null;

            await user.save();


            // ------------------------------------------
            // CLEAR SESSION
            // ------------------------------------------

            clearVerificationSession(req);


            req.session.save(
                (sessionError) => {

                    if (sessionError) {

                        console.error(
                            "Verification session save error:",
                            sessionError
                        );

                        return res
                            .status(500)
                            .send(
                                "Email verified, but session could not be saved."
                            );

                    }

                    return res.redirect(
                        "/user/login?verified=true"
                    );

                }
            );

        } catch (error) {

            console.error(
                "OTP verification error:",
                error
            );

            return res
                .status(500)
                .send(
                    "Unable to verify OTP."
                );

        }

    }
);


// ==================================================
// RESEND OTP
// ==================================================

router.post(
    "/resend-otp",
    async (req, res) => {

        try {

            const userId =
                req.session?.emailVerificationUserId;


            if (!userId) {

                return res.redirect(
                    "/user/register"
                );

            }


            const user =
                await User.findById(
                    userId
                );


            if (!user) {

                clearVerificationSession(req);

                return res.redirect(
                    "/user/register"
                );

            }


            if (user.emailVerified) {

                clearVerificationSession(req);

                return res.redirect(
                    "/user/login?verified=true"
                );

            }


            // ------------------------------------------
            // NEW OTP
            // ------------------------------------------

            const newOTP =
                generateOTP();

            const newOTPExpires =
                getOTPExpiry();


            user.emailOTP =
                newOTP;

            user.emailOTPExpires =
                newOTPExpires;


            await user.save();


            saveOTPInSession(
                req,
                user,
                newOTP,
                newOTPExpires
            );


            // ------------------------------------------
            // DEVELOPMENT LOG
            // ------------------------------------------

            if (
                process.env.NODE_ENV !== "production"
            ) {

                console.log(
                    "================================"
                );

                console.log(
                    "RESEND OTP"
                );

                console.log(
                    "Email:",
                    user.email
                );

                console.log(
                    "OTP:",
                    newOTP
                );

                console.log(
                    "Expires:",
                    newOTPExpires
                );

                console.log(
                    "================================"
                );

            }


            // ------------------------------------------
            // SEND OTP
            // ------------------------------------------

            const emailResult =
                await sendOTPEmail(
                    user.email,
                    user.name,
                    newOTP
                );


            req.session.save(
                (sessionError) => {

                    if (sessionError) {

                        console.error(
                            "Resend OTP session save error:",
                            sessionError
                        );

                        return res
                            .status(500)
                            .send(
                                "OTP generated, but session could not be saved."
                            );

                    }


                    if (
                        emailResult &&
                        emailResult.success
                    ) {

                        return renderVerificationPage(
                            res,
                            user.email,
                            null,
                            "A new OTP has been sent to your email."
                        );

                    }


                    return renderVerificationPage(
                        res,
                        user.email,
                        "OTP generated, but email could not be sent. Please try Resend OTP again."
                    );

                }
            );

        } catch (error) {

            console.error(
                "Resend OTP error:",
                error
            );

            return res
                .status(500)
                .send(
                    "Unable to resend OTP."
                );

        }

    }
);


// ==================================================
// LOGIN PAGE
// ==================================================

router.get(
    "/login",
    (req, res) => {

        try {

            if (req.session?.userId) {

                return res.redirect(
                    getSafeRedirect(
                        req.query.redirect
                    )
                );

            }


            let success = null;


            if (
                req.query.registered === "true"
            ) {

                success =
                    "Registration successful. Please verify your email first.";

            }


            if (
                req.query.verified === "true"
            ) {

                success =
                    "Email verified successfully. Please login.";

            }


            const safeRedirect =
                getSafeRedirect(
                    req.query.redirect
                );


            return res.render(
                "user/login",
                {

                    title:
                        "Login | Yogita Patola Art",

                    description:
                        "Login to your Yogita Patola Art account.",

                    error:
                        null,

                    success:
                        success,

                    redirect:
                        safeRedirect,

                    redirectUrl:
                        safeRedirect,

                    pageCss:
                        "/css/pages/login.css"

                }
            );

        } catch (error) {

            console.error(
                "Login page error:",
                error
            );

            return res
                .status(500)
                .send(
                    "Unable to open login page."
                );

        }

    }
);


// ==================================================
// LOGIN USER
// ==================================================

router.post(
    "/login",
    async (req, res) => {

        try {

            const {
                email,
                password,
                redirect
            } = req.body;


            // ------------------------------------------
            // REQUIRED
            // ------------------------------------------

            if (
                !email ||
                !password
            ) {

                return renderLoginError(
                    res,
                    "Please enter email and password.",
                    redirect
                );

            }


            // ------------------------------------------
            // CLEAN EMAIL
            // ------------------------------------------

            const cleanEmail =
                typeof email === "string"
                    ? email.trim().toLowerCase()
                    : "";


            // ------------------------------------------
            // FIND USER
            // ------------------------------------------

            const user =
                await User.findOne({
                    email: cleanEmail
                });


            if (!user) {

                return renderLoginError(
                    res,
                    "Invalid email or password.",
                    redirect
                );

            }


            // ------------------------------------------
            // PASSWORD
            // ------------------------------------------

            const passwordMatch =
                await bcrypt.compare(
                    password,
                    user.password
                );


            if (!passwordMatch) {

                return renderLoginError(
                    res,
                    "Invalid email or password.",
                    redirect
                );

            }


            // ------------------------------------------
            // ACCOUNT STATUS
            // ------------------------------------------

            if (!user.isActive) {

                return renderLoginError(
                    res,
                    "Your account is inactive.",
                    redirect
                );

            }


            // ------------------------------------------
            // EMAIL VERIFICATION
            // ------------------------------------------

            if (!user.emailVerified) {

                const existingOTP =
                    user.emailOTP
                        ? String(
                            user.emailOTP
                        ).trim()
                        : "";

                const existingOTPExpires =
                    user.emailOTPExpires;


                // --------------------------------------
                // EXISTING VALID OTP
                // --------------------------------------

                if (
                    existingOTP &&
                    !isOTPExpired(
                        existingOTPExpires
                    )
                ) {

                    saveOTPInSession(
                        req,
                        user,
                        existingOTP,
                        existingOTPExpires
                    );

                } else {

                    // ----------------------------------
                    // NEW OTP
                    // ----------------------------------

                    const otp =
                        generateOTP();

                    const otpExpires =
                        getOTPExpiry();


                    user.emailOTP =
                        otp;

                    user.emailOTPExpires =
                        otpExpires;


                    await user.save();


                    saveOTPInSession(
                        req,
                        user,
                        otp,
                        otpExpires
                    );


                    // ----------------------------------
                    // SEND OTP
                    // ----------------------------------

                    const emailResult =
                        await sendOTPEmail(
                            user.email,
                            user.name,
                            otp
                        );


                    if (
                        !emailResult ||
                        !emailResult.success
                    ) {

                        console.error(
                            "Login verification OTP email failed:",
                            emailResult?.error
                        );

                    }

                }


                return req.session.save(
                    (sessionError) => {

                        if (sessionError) {

                            console.error(
                                "Login verification session error:",
                                sessionError
                            );

                            return res
                                .status(500)
                                .send(
                                    "Unable to start email verification."
                                );

                        }

                        return res.redirect(
                            "/user/verify-email"
                        );

                    }
                );

            }


            // ==================================================
            // VERIFIED USER
            // ==================================================

            req.session.regenerate(
                (sessionError) => {

                    if (sessionError) {

                        console.error(
                            "Session regeneration error:",
                            sessionError
                        );

                        return res
                            .status(500)
                            .send(
                                "Unable to login. Please try again."
                            );

                    }


                    // --------------------------------------
                    // AUTH SESSION
                    // --------------------------------------

                    req.session.userId =
                        user._id.toString();

                    req.session.userName =
                        user.name;

                    req.session.userEmail =
                        user.email;


                    // --------------------------------------
                    // SAVE
                    // --------------------------------------

                    req.session.save(
                        (saveError) => {

                            if (saveError) {

                                console.error(
                                    "Login session save error:",
                                    saveError
                                );

                                return res
                                    .status(500)
                                    .send(
                                        "Unable to login. Please try again."
                                    );

                            }


                            return res.redirect(
                                getSafeRedirect(
                                    redirect
                                )
                            );

                        }
                    );

                }
            );

        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            return res
                .status(500)
                .send(
                    "Unable to login."
                );

        }

    }
);


// ==================================================
// LOGOUT
// ==================================================

router.get(
    "/logout",
    (req, res) => {

        if (!req.session) {
            return res.redirect("/");
        }


        req.session.destroy(
            (error) => {

                if (error) {

                    console.error(
                        "Logout error:",
                        error
                    );

                    return res.redirect("/");
                }


                res.clearCookie(
                    "connect.sid"
                );


                return res.redirect("/");

            }
        );

    }
);


// ==================================================
// PROFILE
// ==================================================

router.get(
    "/profile",
    async (req, res) => {

        try {

            if (!req.session?.userId) {

                return res.redirect(
                    "/user/login?redirect=/user/profile"
                );

            }


            const user =
                await User.findById(
                    req.session.userId
                ).select(
                    "-password -emailOTP -emailOTPExpires"
                );


            if (!user) {

                req.session.destroy(
                    () => {}
                );

                return res.redirect(
                    "/user/login"
                );

            }


            return res.render(
                "user/profile",
                {
                    title: "My Profile",
                    user
                }
            );

        } catch (error) {

            console.error(
                "Profile error:",
                error
            );

            return res
                .status(500)
                .send(
                    "Unable to open profile."
                );

        }

    }
);


// ==================================================
// EDIT PROFILE PAGE
// ==================================================

router.get(
    "/profile/edit",
    async (req, res) => {

        try {

            if (!req.session?.userId) {

                return res.redirect(
                    "/user/login?redirect=/user/profile/edit"
                );

            }


            const user =
                await User.findById(
                    req.session.userId
                ).select(
                    "-password -emailOTP -emailOTPExpires"
                );


            if (!user) {

                req.session.destroy(
                    () => {}
                );

                return res.redirect(
                    "/user/login"
                );

            }


            return res.render(
                "user/edit-profile",
                {
                    title: "Edit Profile",
                    user,
                    error: null,
                    success: null
                }
            );

        } catch (error) {

            console.error(
                "Edit profile page error:",
                error
            );

            return res
                .status(500)
                .send(
                    "Unable to open edit profile."
                );

        }

    }
);


// ==================================================
// UPDATE PROFILE
// ==================================================

router.post(
    "/profile/edit",
    async (req, res) => {

        try {

            if (!req.session?.userId) {

                return res.redirect(
                    "/user/login?redirect=/user/profile/edit"
                );

            }


            const name =
                typeof req.body.name === "string"
                    ? req.body.name.trim()
                    : "";


            const phone =
                typeof req.body.phone === "string"
                    ? req.body.phone.trim()
                    : "";


            const user =
                await User.findById(
                    req.session.userId
                );


            if (!user) {

                req.session.destroy(
                    () => {}
                );

                return res.redirect(
                    "/user/login"
                );

            }


            // ------------------------------------------
            // NAME
            // ------------------------------------------

            if (!name) {

                return res.render(
                    "user/edit-profile",
                    {
                        title: "Edit Profile",
                        user,
                        error: "Name is required.",
                        success: null
                    }
                );

            }


            if (
                name.length < 2 ||
                name.length > 50
            ) {

                return res.render(
                    "user/edit-profile",
                    {
                        title: "Edit Profile",
                        user,
                        error:
                            "Name must be between 2 and 50 characters.",
                        success: null
                    }
                );

            }


            // ------------------------------------------
            // PHONE
            // ------------------------------------------

            if (
                phone &&
                !/^[0-9+\-\s()]{7,20}$/.test(phone)
            ) {

                return res.render(
                    "user/edit-profile",
                    {
                        title: "Edit Profile",
                        user,
                        error:
                            "Please enter a valid phone number.",
                        success: null
                    }
                );

            }


            // ------------------------------------------
            // UPDATE
            // ------------------------------------------

            user.name =
                name;

            user.phone =
                phone;


            await user.save();


            // ------------------------------------------
            // UPDATE SESSION NAME
            // ------------------------------------------

            req.session.userName =
                user.name;


            return res.render(
                "user/edit-profile",
                {
                    title: "Edit Profile",
                    user,
                    error: null,
                    success:
                        "Profile updated successfully."
                }
            );

        } catch (error) {

            console.error(
                "Update profile error:",
                error
            );

            return res
                .status(500)
                .send(
                    "Unable to update profile."
                );

        }

    }
);


// ==================================================
// EXPORT
// ==================================================

module.exports = router;