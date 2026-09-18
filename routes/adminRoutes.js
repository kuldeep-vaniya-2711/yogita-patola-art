const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.use((req, res, next) => {
    res.locals.adminName =
        req.session?.adminName || "Admin";

    next();
});

const Product = require("../models/Product");
const Admin = require("../models/Admin");
const Review = require("../models/Review");
const Feedback = require("../models/Feedback");
const Visitor = require("../models/Visitor");
const Wishlist = require("../models/Wishlist");
const Contact = require("../models/Contact");
const Settings = require("../models/Settings");

const reviewController = require("../controllers/reviewController");
const feedbackController = require("../controllers/feedbackController");

// =========================================================
// EMAIL + OTP SERVICES
// =========================================================

const {
    sendAdminPasswordResetOTP
} = require("../services/emailService");

const {
    generateOTP,
    getOTPExpiry,
    isOTPExpired
} = require("../services/otpService");

// =========================================================
// HELPERS
// =========================================================

const validId = id =>
    mongoose.Types.ObjectId.isValid(id);

function adminAuth(req, res, next) {
    if (req.session?.adminId) {
        return next();
    }

    return res.redirect("/admin/login");
}

function deleteImageFile(imagePath) {
    try {
        if (!imagePath) {
            return;
        }

        const cleanPath =
            String(imagePath).replace(/^\/+/, "");

        const fullPath =
            path.join(
                __dirname,
                "../public",
                cleanPath
            );

        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
    } catch (error) {
        console.error(
            "Image delete error:",
            error
        );
    }
}

const imagePaths = files =>
    (files || []).map(
        file =>
            "/uploads/products/" +
            file.filename
    );

const deleteUploadedFiles = files => {
    (files || []).forEach(file => {
        deleteImageFile(
            "/uploads/products/" +
            file.filename
        );
    });
};

const deleteSettingsFiles = files => {
    if (!files) {
        return;
    }

    Object.values(files)
        .flat()
        .forEach(file => {
            deleteImageFile(
                "/uploads/settings/" +
                file.filename
            );
        });
};

// =========================================================
// MULTER
// =========================================================

function createStorage(subfolder) {
    return multer.diskStorage({
        destination: (req, file, cb) => {
            const dir =
                path.join(
                    __dirname,
                    "../public/uploads",
                    subfolder
                );

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(
                    dir,
                    { recursive: true }
                );
            }

            cb(null, dir);
        },

        filename: (req, file, cb) => {
            const ext =
                path.extname(
                    file.originalname
                ).toLowerCase();

            cb(
                null,
                `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
            );
        }
    });
}

const fileFilter = (req, file, cb) => {
    const allowed = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    ];

    if (allowed.includes(file.mimetype)) {
        return cb(null, true);
    }

    cb(
        new Error(
            "Only JPG, JPEG, PNG and WEBP images are allowed."
        )
    );
};

const productUpload = multer({
    storage: createStorage("products"),

    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 5
    },

    fileFilter
});

const settingsUpload = multer({
    storage: createStorage("settings"),

    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 8
    },

    fileFilter
});

// =========================================================
// ADMIN ROOT / AUTH
// =========================================================

router.get(
    "/",
    adminAuth,
    (req, res) => {
        return res.redirect(
            "/admin/dashboard"
        );
    }
);

// =========================================================
// ADMIN LOGIN
// =========================================================

router.get(
    "/login",
    (req, res) => {
        if (req.session?.adminId) {
            return res.redirect(
                "/admin/dashboard"
            );
        }

        return res.render(
            "admin/login",
            {
                title: "Admin Login",
                error: req.query.error || "",
                success: req.query.success || ""
            }
        );
    }
);

router.post(
    "/login",
    async (req, res) => {
        try {
            const email =
                String(
                    req.body.email || ""
                )
                    .trim()
                    .toLowerCase();

            const password =
                req.body.password;

            if (!email || !password) {
                return res.redirect(
                    "/admin/login?error=Please+enter+email+and+password"
                );
            }

            const admin =
                await Admin.findOne({
                    email
                });

            if (
                !admin ||
                !(await bcrypt.compare(
                    password,
                    admin.password
                ))
            ) {
                return res.redirect(
                    "/admin/login?error=Invalid+email+or+password"
                );
            }

            req.session.adminId =
                admin._id;

            req.session.adminEmail =
                admin.email;


            req.session.adminName =
                admin.name || "Admin";

            return res.redirect(
                "/admin/dashboard"
            );
        } catch (error) {
            console.error(
                "Admin login error:",
                error
            );

            return res.redirect(
                "/admin/login?error=Server+error"
            );
        }
    }
);

// =========================================================
// ADMIN FORGOT PASSWORD
// =========================================================

router.get(
    "/forgot-password",
    (req, res) => {
        if (req.session?.adminId) {
            return res.redirect(
                "/admin/dashboard"
            );
        }

        return res.render(
            "admin/forgot-password",
            {
                title: "Forgot Password",
                error: req.query.error || "",
                success: req.query.success || ""
            }
        );
    }
);

router.post(
    "/forgot-password",
    async (req, res) => {
        try {
            const email =
                String(
                    req.body.email || ""
                )
                    .trim()
                    .toLowerCase();

            if (!email) {
                return res.redirect(
                    "/admin/forgot-password?error=Please+enter+your+admin+email"
                );
            }

            const admin =
                await Admin.findOne({
                    email
                });

            /*
             * Do not reveal whether an admin
             * account exists.
             */

            if (!admin) {
                return res.redirect(
                    "/admin/forgot-password?success=If+this+email+belongs+to+an+admin+account%2C+an+OTP+has+been+sent"
                );
            }

            const otp =
                generateOTP();

            const otpExpiry =
                getOTPExpiry();

            admin.resetOtp =
                otp;

            admin.resetOtpExpires =
                otpExpiry;

            await admin.save();

            const emailResult =
                await sendAdminPasswordResetOTP(
                    admin.email,
                    admin.name || "Admin",
                    otp
                );

            if (
                !emailResult ||
                !emailResult.success
            ) {
                admin.resetOtp = null;
                admin.resetOtpExpires = null;

                await admin.save();

                console.error(
                    "Admin reset OTP email failed:",
                    emailResult?.error
                );

                return res.redirect(
                    "/admin/forgot-password?error=Unable+to+send+OTP.+Please+try+again"
                );
            }

            console.log(
                "\n================================="
            );
            console.log(
                "ADMIN PASSWORD RESET OTP"
            );
            console.log(
                "Email:",
                admin.email
            );
            console.log(
                "OTP:",
                otp
            );
            console.log(
                "Expires:",
                otpExpiry
            );
            console.log(
                "=================================\n"
            );

            /*
             * Store only the email in session.
             * The password cannot be reset until
             * OTP verification succeeds.
             */

            req.session.adminResetEmail =
                admin.email;

            req.session.adminResetVerified =
                false;

            return res.redirect(
                "/admin/verify-reset-otp"
            );
        } catch (error) {
            console.error(
                "Admin forgot password error:",
                error
            );

            return res.redirect(
                "/admin/forgot-password?error=Something+went+wrong.+Please+try+again"
            );
        }
    }
);

// =========================================================
// VERIFY RESET OTP
// =========================================================

router.get(
    "/verify-reset-otp",
    (req, res) => {
        const email =
            req.session?.adminResetEmail;

        if (!email) {
            return res.redirect(
                "/admin/forgot-password?error=Please+request+a+new+OTP"
            );
        }

        return res.render(
            "admin/verify-reset-otp",
            {
                title: "Verify OTP",
                email,
                error: req.query.error || "",
                success: req.query.success || ""
            }
        );
    }
);

router.post(
    "/verify-reset-otp",
    async (req, res) => {
        try {
            const email =
                req.session?.adminResetEmail;

            if (!email) {
                return res.redirect(
                    "/admin/forgot-password?error=Please+request+a+new+OTP"
                );
            }

            const otp =
                String(
                    req.body.otp || ""
                ).trim();

            if (!/^\d{6}$/.test(otp)) {
                return res.redirect(
                    "/admin/verify-reset-otp?error=Please+enter+a+valid+6+digit+OTP"
                );
            }

            const admin =
                await Admin.findOne({
                    email
                });

            if (!admin) {
                req.session.adminResetEmail = null;
                req.session.adminResetVerified = false;

                return res.redirect(
                    "/admin/forgot-password?error=Invalid+reset+request"
                );
            }

            if (
                !admin.resetOtp ||
                !admin.resetOtpExpires
            ) {
                return res.redirect(
                    "/admin/verify-reset-otp?error=OTP+is+invalid.+Please+request+a+new+OTP"
                );
            }

            if (
                isOTPExpired(
                    admin.resetOtpExpires
                )
            ) {
                admin.resetOtp = null;
                admin.resetOtpExpires = null;

                await admin.save();

                return res.redirect(
                    "/admin/verify-reset-otp?error=OTP+has+expired.+Please+request+a+new+OTP"
                );
            }

            if (
                admin.resetOtp !== otp
            ) {
                return res.redirect(
                    "/admin/verify-reset-otp?error=Invalid+OTP.+Please+try+again"
                );
            }

            /*
             * OTP is valid.
             *
             * Clear OTP immediately so it cannot
             * be reused.
             */

            admin.resetOtp = null;
            admin.resetOtpExpires = null;

            await admin.save();

            req.session.adminResetVerified =
                true;

            return res.redirect(
                "/admin/reset-password"
            );
        } catch (error) {
            console.error(
                "Admin OTP verification error:",
                error
            );

            return res.redirect(
                "/admin/verify-reset-otp?error=Something+went+wrong.+Please+try+again"
            );
        }
    }
);

// =========================================================
// RESEND RESET OTP
// =========================================================

router.post(
    "/resend-reset-otp",
    async (req, res) => {
        try {
            const email =
                req.session?.adminResetEmail;

            if (!email) {
                return res.redirect(
                    "/admin/forgot-password?error=Please+request+a+new+OTP"
                );
            }

            const admin =
                await Admin.findOne({
                    email
                });

            if (!admin) {
                return res.redirect(
                    "/admin/forgot-password?error=Invalid+reset+request"
                );
            }

            const otp =
                generateOTP();

            const otpExpiry =
                getOTPExpiry();

            admin.resetOtp =
                otp;

            admin.resetOtpExpires =
                otpExpiry;

            await admin.save();

            const emailResult =
                await sendAdminPasswordResetOTP(
                    admin.email,
                    admin.name || "Admin",
                    otp
                );

            if (
                !emailResult ||
                !emailResult.success
            ) {
                admin.resetOtp = null;
                admin.resetOtpExpires = null;

                await admin.save();

                return res.redirect(
                    "/admin/verify-reset-otp?error=Unable+to+send+OTP.+Please+try+again"
                );
            }

            return res.redirect(
                "/admin/verify-reset-otp?success=A+new+OTP+has+been+sent+to+your+email"
            );
        } catch (error) {
            console.error(
                "Admin resend OTP error:",
                error
            );

            return res.redirect(
                "/admin/verify-reset-otp?error=Unable+to+send+OTP"
            );
        }
    }
);

// =========================================================
// RESET PASSWORD
// =========================================================

router.get(
    "/reset-password",
    (req, res) => {
        if (
            !req.session?.adminResetEmail ||
            !req.session?.adminResetVerified
        ) {
            return res.redirect(
                "/admin/forgot-password?error=Please+verify+your+OTP+first"
            );
        }

        return res.render(
            "admin/reset-password",
            {
                title: "Reset Password",
                error: req.query.error || "",
                success: req.query.success || ""
            }
        );
    }
);

router.post(
    "/reset-password",
    async (req, res) => {
        try {
            const email =
                req.session?.adminResetEmail;

            const verified =
                req.session?.adminResetVerified;

            if (!email || !verified) {
                return res.redirect(
                    "/admin/forgot-password?error=Please+verify+your+OTP+first"
                );
            }

            const password =
                String(
                    req.body.password || ""
                );

            const confirmPassword =
                String(
                    req.body.confirmPassword || ""
                );

            if (!password || !confirmPassword) {
                return res.redirect(
                    "/admin/reset-password?error=Please+enter+both+password+fields"
                );
            }

            if (password.length < 8) {
                return res.redirect(
                    "/admin/reset-password?error=Password+must+be+at+least+8+characters"
                );
            }

            if (password !== confirmPassword) {
                return res.redirect(
                    "/admin/reset-password?error=Passwords+do+not+match"
                );
            }

            const admin =
                await Admin.findOne({
                    email
                });

            if (!admin) {
                req.session.adminResetEmail = null;
                req.session.adminResetVerified = false;

                return res.redirect(
                    "/admin/forgot-password?error=Admin+account+not+found"
                );
            }

            const hashedPassword =
                await bcrypt.hash(
                    password,
                    10
                );

            admin.password =
                hashedPassword;

            admin.resetOtp = null;
            admin.resetOtpExpires = null;

            await admin.save();

            /*
             * Destroy reset session data.
             * User must log in with the new password.
             */

            req.session.adminResetEmail = null;
            req.session.adminResetVerified = false;

            return res.redirect(
                "/admin/login?success=Password+reset+successfully.+Please+login+with+your+new+password"
            );
        } catch (error) {
            console.error(
                "Admin password reset error:",
                error
            );

            return res.redirect(
                "/admin/reset-password?error=Unable+to+reset+password.+Please+try+again"
            );
        }
    }
);

// =========================================================
// CHANGE PASSWORD
// =========================================================

router.get(
    "/change-password",
    adminAuth,
    (req, res) => {
        return res.render(
            "admin/change-password",
            {
                title: "Change Password",
                pageTitle: "Change Password",
                error: req.query.error || "",
                success: req.query.success || ""
            }
        );
    }
);

router.post(
    "/change-password",
    adminAuth,
    async (req, res) => {
        try {
            const currentPassword =
                String(req.body.currentPassword || "");

            const newPassword =
                String(req.body.newPassword || "");

            const confirmPassword =
                String(req.body.confirmPassword || "");

            if (!currentPassword || !newPassword || !confirmPassword) {
                return res.redirect(
                    "/admin/change-password?error=Please+fill+all+password+fields"
                );
            }

            if (newPassword.length < 8) {
                return res.redirect(
                    "/admin/change-password?error=New+password+must+be+at+least+8+characters"
                );
            }

            if (newPassword !== confirmPassword) {
                return res.redirect(
                    "/admin/change-password?error=New+passwords+do+not+match"
                );
            }

            const admin =
                await Admin.findById(req.session.adminId);

            if (!admin) {
                req.session.destroy(() => {});

                return res.redirect(
                    "/admin/login?error=Admin+account+not+found"
                );
            }

            const passwordValid =
                await bcrypt.compare(
                    currentPassword,
                    admin.password
                );

            if (!passwordValid) {
                return res.redirect(
                    "/admin/change-password?error=Current+password+is+incorrect"
                );
            }

            admin.password =
                await bcrypt.hash(newPassword, 10);

            await admin.save();

            return res.redirect(
                "/admin/change-password?success=Password+changed+successfully"
            );
        } catch (error) {
            console.error(
                "Admin change password error:",
                error
            );

            return res.redirect(
                "/admin/change-password?error=Unable+to+change+password.+Please+try+again"
            );
        }
    }
);

// =========================================================
// ADMIN MANAGEMENT
// =========================================================

router.get(
    "/admins",
    adminAuth,
    async (req, res) => {
        try {
            const admins =
                await Admin.find({})
                    .sort({ createdAt: -1 });

            return res.render(
                "admin/admins",
                {
                    title: "Admin Management",
                    pageTitle: "Admin Management",
                    admins,
                    error: req.query.error || "",
                    success: req.query.success || ""
                }
            );
        } catch (error) {
            console.error(
                "Admin management error:",
                error
            );

            return res.status(500).send(
                "Unable to load admin management."
            );
        }
    }
);

router.post(
    "/admins/add",
    adminAuth,
    async (req, res) => {
        try {
            const name =
                String(req.body.name || "").trim();

            const email =
                String(req.body.email || "")
                    .trim()
                    .toLowerCase();

            const password =
                String(req.body.password || "");

            const confirmPassword =
                String(req.body.confirmPassword || "");

            if (!name || !email || !password || !confirmPassword) {
                return res.redirect(
                    "/admin/admins?error=Please+fill+all+admin+fields"
                );
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                return res.redirect(
                    "/admin/admins?error=Please+enter+a+valid+email+address"
                );
            }

            if (password.length < 8) {
                return res.redirect(
                    "/admin/admins?error=Password+must+be+at+least+8+characters"
                );
            }

            if (password !== confirmPassword) {
                return res.redirect(
                    "/admin/admins?error=Passwords+do+not+match"
                );
            }

            const existingAdmin =
                await Admin.findOne({ email });

            if (existingAdmin) {
                return res.redirect(
                    "/admin/admins?error=An+admin+with+this+email+already+exists"
                );
            }

            const hashedPassword =
                await bcrypt.hash(password, 10);

            const admin =
                new Admin({
                    name,
                    email,
                    password: hashedPassword
                });

            await admin.save();

            return res.redirect(
                "/admin/admins?success=New+admin+created+successfully"
            );
        } catch (error) {
            console.error(
                "Create admin error:",
                error
            );

            if (error?.code === 11000) {
                return res.redirect(
                    "/admin/admins?error=An+admin+with+this+email+already+exists"
                );
            }

            return res.redirect(
                "/admin/admins?error=Unable+to+create+admin.+Please+try+again"
            );
        }
    }
);

// =========================================================
// DELETE ADMIN
// =========================================================

router.post(
    "/admins/delete/:id",
    adminAuth,
    async (req, res) => {
        try {
            if (!validId(req.params.id)) {
                return res.redirect(
                    "/admin/admins?error=Invalid+admin+ID"
                );
            }

            if (
                String(req.params.id) ===
                String(req.session.adminId)
            ) {
                return res.redirect(
                    "/admin/admins?error=You+cannot+delete+your+own+admin+account"
                );
            }

            const admin =
                await Admin.findById(
                    req.params.id
                );

            if (!admin) {
                return res.redirect(
                    "/admin/admins?error=Admin+not+found"
                );
            }

            await Admin.findByIdAndDelete(
                req.params.id
            );

            return res.redirect(
                "/admin/admins?success=Admin+deleted+successfully"
            );
        } catch (error) {
            console.error(
                "Delete admin error:",
                error
            );

            return res.redirect(
                "/admin/admins?error=Unable+to+delete+admin"
            );
        }
    }
);

// =========================================================
// ADMIN LOGOUT
// =========================================================

router.get(
    "/logout",
    (req, res) => {
        if (!req.session) {
            return res.redirect(
                "/admin/login"
            );
        }

        req.session.destroy(
            error => {
                if (error) {
                    console.error(
                        "Admin logout error:",
                        error
                    );
                }

                return res.redirect(
                    "/admin/login"
                );
            }
        );
    }
);

// =========================================================
// DASHBOARD
// =========================================================

router.get(
    "/dashboard",
    adminAuth,
    async (req, res) => {
        try {
            const [
                productCount,
                reviewCount,
                feedbackCount,
                visitorCount,
                wishlistCount,
                contactCount,
                recentProducts,
                recentReviews,
                recentFeedback,
                recentContacts
            ] = await Promise.all([
                Product.countDocuments(),

                Review.countDocuments(),

                Feedback.countDocuments(),

                Visitor.countDocuments(),

                Wishlist.countDocuments(),

                Contact.countDocuments(),

                Product.find({})
                    .sort({ createdAt: -1 })
                    .limit(5),

                Review.find({})
                    .sort({ createdAt: -1 })
                    .limit(5),

                Feedback.find({})
                    .sort({ createdAt: -1 })
                    .limit(5),

                Contact.find({})
                    .sort({ createdAt: -1 })
                    .limit(5)
            ]);

            return res.render(
                "admin/dashboard",
                {
                    title: "Admin Dashboard",

                    pageTitle:
                        "Dashboard",

                    pageCss:
                        "/css/admin/dashboard.css",

                    pageJs:
                        "/js/admin/dashboard.js",

                    productCount,
                    reviewCount,
                    feedbackCount,
                    visitorCount,
                    wishlistCount,
                    contactCount,

                    recentProducts,
                    recentReviews,
                    recentFeedback,
                    recentContacts
                }
            );
        } catch (error) {
            console.error(
                "Admin dashboard error:",
                error
            );

            return res.status(500).send(
                "Unable to load admin dashboard."
            );
        }
    }
);

// =========================================================
// VISITORS
// =========================================================

router.get(
    "/visitors",
    adminAuth,
    async (req, res) => {
        try {
            const visitors =
                await Visitor.find({})
                    .sort({
                        visitedAt: -1
                    });

            return res.render(
                "admin/visitors",
                {
                    title:
                        "Visitors",

                    pageTitle:
                        "Visitors",

                    pageCss:
                        "/css/admin/visitors.css",

                    pageJs:
                        "/js/admin/visitors.js",

                    visitors
                }
            );
        } catch (error) {
            console.error(
                "Admin visitors error:",
                error
            );

            return res.status(500).send(
                "Unable to load visitors."
            );
        }
    }
);

router.post(
    "/visitors/delete/:id",
    adminAuth,
    async (req, res) => {
        try {
            if (!validId(req.params.id)) {
                return res.redirect(
                    "/admin/visitors?error=Invalid+visitor+ID"
                );
            }

            await Visitor.findByIdAndDelete(
                req.params.id
            );

            return res.redirect(
                "/admin/visitors?success=Visitor+deleted"
            );
        } catch (error) {
            console.error(
                "Visitor delete error:",
                error
            );

            return res.redirect(
                "/admin/visitors?error=Unable+to+delete+visitor"
            );
        }
    }
);

// =========================================================
// PRODUCTS
// =========================================================

router.get(
    "/products",
    adminAuth,
    async (req, res) => {
        try {
            const products =
                await Product.find({})
                    .sort({
                        createdAt: -1
                    });

            return res.render(
                "admin/products",
                {
                    title:
                        "Products",

                    pageTitle:
                        "Products",

                    pageCss:
                        "/css/admin/products.css",

                    pageJs:
                        "/js/admin/products.js",

                    products,

                    success:
                        req.query.success || "",

                    error:
                        req.query.error || ""
                }
            );
        } catch (error) {
            console.error(
                "Admin products error:",
                error
            );

            return res.status(500).send(
                "Unable to load products."
            );
        }
    }
);

router.get(
    "/products/add",
    adminAuth,
    (req, res) => {
        return res.render(
            "admin/add-product",
            {
                title:
                    "Add Product",

                pageTitle:
                    "Add Product",

                pageCss:
                    "/css/admin/add-product.css",

                pageJs:
                    "/js/admin/add-product.js",

                error:
                    req.query.error || ""
            }
        );
    }
);

router.post(
    "/products/add",
    adminAuth,
    productUpload.array(
        "productImages",
        5
    ),
    async (req, res) => {
        try {
            const {
                name,
                category,
                description,
                price,
                discountEnabled,
                discountPercentage,
                fabric,
                technique,
                color,
                dimensions,
                availability
            } = req.body;

            if (!name || !category) {
                deleteUploadedFiles(
                    req.files
                );

                return res.redirect(
                    "/admin/products/add?error=Product+name+and+category+are+required"
                );
            }

            const isDiscountEnabled =
                discountEnabled === true ||
                discountEnabled === "true";

            let percentage = 0;

            if (isDiscountEnabled) {
                percentage =
                    Number(
                        discountPercentage
                    );

                if (
                    !Number.isFinite(
                        percentage
                    ) ||
                    percentage < 1 ||
                    percentage > 100
                ) {
                    deleteUploadedFiles(
                        req.files
                    );

                    return res.redirect(
                        "/admin/products/add?error=Discount+percentage+must+be+between+1+and+100"
                    );
                }
            }

            const featured =
                req.body.featured === true ||
                req.body.featured === "true" ||
                req.body.featured === "on";

            const product =
                new Product({
                    name:
                        String(name).trim(),

                    category:
                        String(category).trim(),

                    description:
                        description || "",

                    price:
                        price || 0,

                    discountEnabled:
                        isDiscountEnabled,

                    discountPercentage:
                        isDiscountEnabled
                            ? percentage
                            : 0,

                    fabric:
                        fabric || "",

                    technique:
                        technique || "",

                    color:
                        color || "",

                    dimensions:
                        dimensions || "",

                    availability:
                        availability || "",

                    featured,

                    images:
                        imagePaths(req.files)
                });

            await product.save();

            return res.redirect(
                "/admin/products?success=Product+added+successfully"
            );
        } catch (error) {
            console.error(
                "Product add error:",
                error
            );

            deleteUploadedFiles(
                req.files
            );

            return res.redirect(
                "/admin/products/add?error=Unable+to+add+product"
            );
        }
    }
);

router.get(
    "/products/edit/:id",
    adminAuth,
    async (req, res) => {
        try {
            if (!validId(req.params.id)) {
                return res.redirect(
                    "/admin/products?error=Invalid+product+ID"
                );
            }

            const product =
                await Product.findById(
                    req.params.id
                );

            if (!product) {
                return res.redirect(
                    "/admin/products?error=Product+not+found"
                );
            }

            return res.render(
                "admin/edit-product",
                {
                    title:
                        "Edit Product",

                    pageTitle:
                        "Edit Product",

                    pageCss:
                        "/css/admin/add-product.css",

                    pageJs:
                        "/js/admin/add-product.js",

                    product,

                    error:
                        req.query.error || "",

                    success:
                        req.query.success || ""
                }
            );
        } catch (error) {
            console.error(
                "Product edit page error:",
                error
            );

            return res.redirect(
                "/admin/products?error=Unable+to+load+product"
            );
        }
    }
);

router.post(
    "/products/edit/:id",
    adminAuth,
    productUpload.array(
        "productImages",
        5
    ),
    async (req, res) => {
        try {
            if (!validId(req.params.id)) {
                deleteUploadedFiles(
                    req.files
                );

                return res.redirect(
                    "/admin/products?error=Invalid+product+ID"
                );
            }

            const product =
                await Product.findById(
                    req.params.id
                );

            if (!product) {
                deleteUploadedFiles(
                    req.files
                );

                return res.redirect(
                    "/admin/products?error=Product+not+found"
                );
            }

            const category =
                req.body.category ||
                product.category;

            if (!category) {
                deleteUploadedFiles(
                    req.files
                );

                return res.redirect(
                    `/admin/products/edit/${product._id}?error=Product+category+is+required`
                );
            }

            const isDiscountEnabled =
                req.body.discountEnabled === true ||
                req.body.discountEnabled === "true";

            let percentage = 0;

            if (isDiscountEnabled) {
                percentage =
                    Number(
                        req.body.discountPercentage
                    );

                if (
                    !Number.isFinite(
                        percentage
                    ) ||
                    percentage < 1 ||
                    percentage > 100
                ) {
                    deleteUploadedFiles(
                        req.files
                    );

                    return res.redirect(
                        `/admin/products/edit/${product._id}?error=Discount+percentage+must+be+between+1+and+100`
                    );
                }
            }

            product.name =
                String(
                    req.body.name ||
                    product.name
                ).trim();

            product.category =
                String(category).trim();

            product.description =
                req.body.description || "";

            product.price =
                req.body.price || 0;

            product.discountEnabled =
                isDiscountEnabled;

            product.discountPercentage =
                isDiscountEnabled
                    ? percentage
                    : 0;

            product.fabric =
                req.body.fabric || "";

            product.technique =
                req.body.technique || "";

            product.color =
                req.body.color || "";

            product.dimensions =
                req.body.dimensions || "";

            product.availability =
                req.body.availability || "";

            product.featured =
                req.body.featured === true ||
                req.body.featured === "true" ||
                req.body.featured === "on";

            if (
                req.files &&
                req.files.length > 0
            ) {
                if (
                    Array.isArray(
                        product.images
                    )
                ) {
                    product.images.forEach(
                        deleteImageFile
                    );
                }

                product.images =
                    imagePaths(
                        req.files
                    );
            }

            await product.save();

            return res.redirect(
                "/admin/products?success=Product+updated+successfully"
            );
        } catch (error) {
            console.error(
                "Product edit error:",
                error
            );

            deleteUploadedFiles(
                req.files
            );

            return res.redirect(
                `/admin/products/edit/${req.params.id}?error=Unable+to+update+product`
            );
        }
    }
);

router.post(
    "/products/delete/:id",
    adminAuth,
    async (req, res) => {
        try {
            if (!validId(req.params.id)) {
                return res.redirect(
                    "/admin/products?error=Invalid+product+ID"
                );
            }

            const product =
                await Product.findById(
                    req.params.id
                );

            if (!product) {
                return res.redirect(
                    "/admin/products?error=Product+not+found"
                );
            }

            if (
                Array.isArray(
                    product.images
                )
            ) {
                product.images.forEach(
                    deleteImageFile
                );
            }

            await Product.findByIdAndDelete(
                req.params.id
            );

            await Review.deleteMany({
                product: req.params.id
            });

            await Wishlist.deleteMany({
                product: req.params.id
            });

            return res.redirect(
                "/admin/products?success=Product+deleted+successfully"
            );
        } catch (error) {
            console.error(
                "Product delete error:",
                error
            );

            return res.redirect(
                "/admin/products?error=Unable+to+delete+product"
            );
        }
    }
);

// =========================================================
// REVIEWS
// =========================================================

router.get(
    "/reviews",
    adminAuth,
    reviewController.getAdminReviews
);

router.post(
    "/reviews/:id/approve",
    adminAuth,
    reviewController.approveReview
);

router.post(
    "/reviews/:id/reject",
    adminAuth,
    reviewController.rejectReview
);

router.post(
    "/reviews/:id/delete",
    adminAuth,
    reviewController.deleteReview
);

// =========================================================
// WISHLISTS
// =========================================================

router.get(
    "/wishlists",
    adminAuth,
    async (req, res) => {
        try {
            const wishlists =
                await Wishlist.find({})
                    .populate("user")
                    .populate("product")
                    .sort({
                        createdAt: -1
                    });

            return res.render(
                "admin/wishlists",
                {
                    title:
                        "Wishlist Management",

                    pageTitle:
                        "Wishlist Management",

                    wishlists
                }
            );
        } catch (error) {
            console.error(
                "Admin wishlists error:",
                error
            );

            return res.status(500).send(
                "Unable to load wishlists."
            );
        }
    }
);

// =========================================================
// FEEDBACK
// =========================================================

router.get(
    "/feedback",
    adminAuth,
    feedbackController.getAdminFeedback
);

router.post(
    "/feedback/status/:id",
    adminAuth,
    feedbackController.updateFeedbackStatus
);

router.post(
    "/feedback/delete/:id",
    adminAuth,
    feedbackController.deleteFeedback
);

router.patch(
    "/feedback/:id/status",
    adminAuth,
    feedbackController.updateFeedbackStatus
);

router.delete(
    "/feedback/:id",
    adminAuth,
    feedbackController.deleteFeedback
);

// =========================================================
// CONTACTS
// =========================================================

router.get(
    "/contacts",
    adminAuth,
    async (req, res) => {
        try {
            const contacts =
                await Contact.find({})
                    .sort({
                        createdAt: -1
                    });

            return res.render(
                "admin/contacts",
                {
                    title:
                        "Customer Inquiries",

                    pageTitle:
                        "Customer Inquiries",

                    pageCss:
                        "/css/admin/contacts.css",

                    pageJs:
                        "/js/admin/contacts.js",

                    contacts,

                    success:
                        req.query.success || "",

                    error:
                        req.query.error || ""
                }
            );
        } catch (error) {
            console.error(
                "Admin contacts error:",
                error
            );

            return res.status(500).send(
                "Unable to load contacts."
            );
        }
    }
);

router.post(
    "/contacts/status/:id",
    adminAuth,
    async (req, res) => {
        try {
            if (!validId(req.params.id)) {
                return res.redirect(
                    "/admin/contacts?error=Invalid+contact+ID"
                );
            }

            const allowedStatuses = [
                "unread",
                "read",
                "replied"
            ];

            const status =
                String(
                    req.body.status || ""
                ).trim().toLowerCase();

            if (
                !allowedStatuses.includes(
                    status
                )
            ) {
                return res.redirect(
                    "/admin/contacts?error=Invalid+status"
                );
            }

            const contact =
                await Contact.findById(
                    req.params.id
                );

            if (!contact) {
                return res.redirect(
                    "/admin/contacts?error=Contact+not+found"
                );
            }

            contact.status =
                status;

            contact.isRead =
                status !== "unread";

            contact.isReplied =
                status === "replied";

            await contact.save();

            return res.redirect(
                "/admin/contacts?success=Status+updated"
            );
        } catch (error) {
            console.error(
                "Contact status error:",
                error
            );

            return res.redirect(
                "/admin/contacts?error=Unable+to+update+status"
            );
        }
    }
);

router.post(
    "/contacts/read/:id",
    adminAuth,
    async (req, res) => {
        try {
            if (!validId(req.params.id)) {
                return res.redirect(
                    "/admin/contacts?error=Invalid+contact+ID"
                );
            }

            const contact =
                await Contact.findById(
                    req.params.id
                );

            if (!contact) {
                return res.redirect(
                    "/admin/contacts?error=Contact+not+found"
                );
            }

            contact.isRead = true;

            if (
                !contact.status ||
                contact.status === "unread"
            ) {
                contact.status =
                    "read";
            }

            await contact.save();

            return res.redirect(
                "/admin/contacts?success=Contact+marked+as+read"
            );
        } catch (error) {
            console.error(
                "Contact read error:",
                error
            );

            return res.redirect(
                "/admin/contacts?error=Unable+to+update+contact"
            );
        }
    }
);

router.post(
    "/contacts/unread/:id",
    adminAuth,
    async (req, res) => {
        try {
            if (!validId(req.params.id)) {
                return res.redirect(
                    "/admin/contacts?error=Invalid+contact+ID"
                );
            }

            const contact =
                await Contact.findById(
                    req.params.id
                );

            if (!contact) {
                return res.redirect(
                    "/admin/contacts?error=Contact+not+found"
                );
            }

            contact.isRead = false;
            contact.isReplied = false;
            contact.status = "unread";

            await contact.save();

            return res.redirect(
                "/admin/contacts?success=Contact+marked+as+unread"
            );
        } catch (error) {
            console.error(
                "Contact unread error:",
                error
            );

            return res.redirect(
                "/admin/contacts?error=Unable+to+update+contact"
            );
        }
    }
);

router.post(
    "/contacts/delete/:id",
    adminAuth,
    async (req, res) => {
        try {
            if (!validId(req.params.id)) {
                return res.redirect(
                    "/admin/contacts?error=Invalid+contact+ID"
                );
            }

            await Contact.findByIdAndDelete(
                req.params.id
            );

            return res.redirect(
                "/admin/contacts?success=Contact+deleted+successfully"
            );
        } catch (error) {
            console.error(
                "Contact delete error:",
                error
            );

            return res.redirect(
                "/admin/contacts?error=Unable+to+delete+contact"
            );
        }
    }
);

// =========================================================
// SETTINGS
// =========================================================

router.get(
    "/settings",
    adminAuth,
    async (req, res) => {
        try {
            let settings =
                await Settings.findOne();

            if (!settings) {
                settings =
                    new Settings({});

                await settings.save();
            }

            return res.render(
                "admin/settings",
                {
                    title:
                        "Website Settings",

                    pageTitle:
                        "Website Settings",

                    pageCss:
                        "/css/admin/settings.css",

                    pageJs:
                        "/js/admin/settings.js",

                    settingsData:
                        settings,

                    success:
                        req.query.success || "",

                    error:
                        req.query.error || ""
                }
            );
        } catch (error) {
            console.error(
                "Admin settings page error:",
                error
            );

            return res.status(500).send(
                "Unable to load website settings."
            );
        }
    }
);

const settingsFields = [
    {
        name:
            "heroImageFile",
        maxCount: 1
    },

    {
        name:
            "aboutImageFile",
        maxCount: 1
    },

    {
        name:
            "aboutStoryImageFile",
        maxCount: 1
    },

    {
        name:
            "aboutArtImageFile",
        maxCount: 1
    },

    {
        name:
            "faviconFile",
        maxCount: 1
    },

    {
        name:
            "heritageHandcraftedImageFile",
        maxCount: 1
    },

    {
        name:
            "heritageIntricateImageFile",
        maxCount: 1
    },

    {
        name:
            "heritageTimelessImageFile",
        maxCount: 1
    }
];

router.post(
    "/settings",
    adminAuth,
    settingsUpload.fields(
        settingsFields
    ),
    async (req, res) => {
        try {
            const clean =
                value =>
                    String(
                        value || ""
                    ).trim();

            const siteName =
                clean(
                    req.body.siteName
                );

            const siteDescription =
                clean(
                    req.body.siteDescription
                );

            const siteEmail =
                clean(
                    req.body.siteEmail
                ).toLowerCase();

            const sitePhone =
                clean(
                    req.body.sitePhone
                );

            const metaTitle =
                clean(
                    req.body.metaTitle
                );

            const metaDescription =
                clean(
                    req.body.metaDescription
                );

            const metaKeywords =
                clean(
                    req.body.metaKeywords
                );

            const faviconUrl =
                clean(
                    req.body.faviconUrl
                );

            const heroHeading =
                clean(
                    req.body.heroHeading
                );

            const heroDescription =
                clean(
                    req.body.heroDescription
                );

            const heroImage =
                clean(
                    req.body.heroImage
                );

            const aboutHeading =
                clean(
                    req.body.aboutHeading
                );

            const aboutDescription =
                clean(
                    req.body.aboutDescription
                );

            const aboutImage =
                clean(
                    req.body.aboutImage
                );

            const aboutStoryImage =
                clean(
                    req.body.aboutStoryImage
                );

            const aboutArtImage =
                clean(
                    req.body.aboutArtImage
                );

            const heritageHandcraftedImage =
                clean(
                    req.body.heritageHandcraftedImage
                );

            const heritageIntricateImage =
                clean(
                    req.body.heritageIntricateImage
                );

            const heritageTimelessImage =
                clean(
                    req.body.heritageTimelessImage
                );

            const address =
                clean(
                    req.body.address
                );

            const whatsapp =
                clean(
                    req.body.whatsapp
                );

            const instagram =
                clean(
                    req.body.instagram
                );

            const facebook =
                clean(
                    req.body.facebook
                );

            const youtube =
                clean(
                    req.body.youtube
                );

            const isChecked =
                value =>
                    value === true ||
                    value === "true" ||
                    value === "on";

            const maintenanceMode =
                isChecked(
                    req.body.maintenanceMode
                );

            const showContact =
                isChecked(
                    req.body.showContact
                );

            const showFeedback =
                isChecked(
                    req.body.showFeedback
                );

            const showReviews =
                isChecked(
                    req.body.showReviews
                );

            if (!siteName) {
                deleteSettingsFiles(
                    req.files
                );

                return res.redirect(
                    "/admin/settings?error=Website+name+is+required"
                );
            }

            if (
                siteName.length >
                150
            ) {
                deleteSettingsFiles(
                    req.files
                );

                return res.redirect(
                    "/admin/settings?error=Website+name+is+too+long"
                );
            }

            if (
                siteDescription.length >
                500
            ) {
                deleteSettingsFiles(
                    req.files
                );

                return res.redirect(
                    "/admin/settings?error=Website+description+is+too+long"
                );
            }

            if (
                siteEmail &&
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                    siteEmail
                )
            ) {
                deleteSettingsFiles(
                    req.files
                );

                return res.redirect(
                    "/admin/settings?error=Invalid+email+address"
                );
            }

            if (
                sitePhone.length > 30
            ) {
                deleteSettingsFiles(
                    req.files
                );

                return res.redirect(
                    "/admin/settings?error=Phone+number+is+too+long"
                );
            }

            if (
                address.length > 500
            ) {
                deleteSettingsFiles(
                    req.files
                );

                return res.redirect(
                    "/admin/settings?error=Address+is+too+long"
                );
            }

            let settings =
                await Settings.findOne();

            if (!settings) {
                settings =
                    new Settings({});
            }

            const data = {
                siteName,

                siteDescription,

                siteEmail,

                sitePhone,

                metaTitle,

                metaDescription,

                metaKeywords,

                faviconUrl,

                heroHeading,

                heroDescription,

                heroImage,

                aboutHeading,

                aboutDescription,

                aboutImage,

                aboutStoryImage,

                aboutArtImage,

                heritageHandcraftedImage,

                heritageIntricateImage,

                heritageTimelessImage,

                address,

                whatsapp,

                instagram,

                facebook,

                youtube,

                maintenanceMode,

                showContact,

                showFeedback,

                showReviews
            };

            const imageMappings = [
                [
                    "heroImageFile",
                    "heroImage"
                ],

                [
                    "aboutImageFile",
                    "aboutImage"
                ],

                [
                    "aboutStoryImageFile",
                    "aboutStoryImage"
                ],

                [
                    "aboutArtImageFile",
                    "aboutArtImage"
                ],

                [
                    "faviconFile",
                    "faviconUrl"
                ],

                [
                    "heritageHandcraftedImageFile",
                    "heritageHandcraftedImage"
                ],

                [
                    "heritageIntricateImageFile",
                    "heritageIntricateImage"
                ],

                [
                    "heritageTimelessImageFile",
                    "heritageTimelessImage"
                ]
            ];

            imageMappings.forEach(
                ([fileField, property]) => {
                    const uploaded =
                        req.files?.[
                            fileField
                        ]?.[0];

                    if (!uploaded) {
                        data[property] =
                            req.body[property] ||
                            settings[property] ||
                            "";

                        return;
                    }

                    if (
                        settings[property]
                    ) {
                        deleteImageFile(
                            settings[property]
                        );
                    }

                    data[property] =
                        "/uploads/settings/" +
                        uploaded.filename;
                }
            );

            Object.assign(
                settings,
                data
            );

            await settings.save();

            console.log(
                "Website settings updated."
            );

            console.log(
                "Maintenance mode:",
                maintenanceMode
            );

            return res.redirect(
                "/admin/settings?success=Website+settings+updated+successfully"
            );
        } catch (error) {
            console.error(
                "Admin settings update error:",
                error
            );

            deleteSettingsFiles(
                req.files
            );

            return res.redirect(
                "/admin/settings?error=Unable+to+save+website+settings"
            );
        }
    }
);

// =========================================================
// CREATE FIRST ADMIN
// =========================================================

router.get(
    "/create-first-admin",
    async (req, res) => {
        try {
            const existingAdmin =
                await Admin.findOne();

            if (existingAdmin) {
                return res.send(
                    "Admin already exists."
                );
            }

            const email =
                String(
                    process.env.ADMIN_EMAIL || ""
                )
                    .trim()
                    .toLowerCase();

            const password =
                process.env.ADMIN_PASSWORD;

            if (!email || !password) {
                return res.status(500).send(
                    "ADMIN_EMAIL and ADMIN_PASSWORD are required."
                );
            }

            const hashedPassword =
                await bcrypt.hash(
                    password,
                    10
                );

            const admin =
                new Admin({
                    name:
                        "Admin",

                    email,

                    password:
                        hashedPassword
                });

            await admin.save();

            return res.send(
                "First admin created successfully."
            );
        } catch (error) {
            console.error(
                "Create first admin error:",
                error
            );

            return res.status(500).send(
                "Unable to create first admin."
            );
        }
    }
);

module.exports = router;