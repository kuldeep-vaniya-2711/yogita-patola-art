
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const router = express.Router();


// ==================================================
// MODELS
// ==================================================

const Product = require("../models/Product");
const Admin = require("../models/Admin");
const Review = require("../models/Review");
const Feedback = require("../models/Feedback");
const Visitor = require("../models/Visitor");
const Wishlist = require("../models/Wishlist");
const Contact = require("../models/Contact");
const Settings = require("../models/Settings");


// ==================================================
// CONTROLLERS
// ==================================================

const reviewController =
    require("../controllers/reviewController");

const feedbackController =
    require("../controllers/feedbackController");


// ==================================================
// HELPERS
// ==================================================

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
            String(imagePath)
                .replace(/^\/+/, "");

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


function imagePaths(files) {

    return (files || []).map(
        file =>
            "/uploads/products/" +
            file.filename
    );

}


function deleteUploadedFiles(files) {

    (files || []).forEach(file => {

        deleteImageFile(
            "/uploads/products/" +
            file.filename
        );

    });

}


function deleteSettingsFiles(files) {

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

}


// ==================================================
// PRODUCT MULTER
// ==================================================

const productStorage =
    multer.diskStorage({

        destination: (req, file, cb) => {

            const dir =
                path.join(
                    __dirname,
                    "../public/uploads/products"
                );

            if (!fs.existsSync(dir)) {

                fs.mkdirSync(
                    dir,
                    {
                        recursive: true
                    }
                );

            }

            cb(null, dir);

        },

        filename: (req, file, cb) => {

            const filename =
                Date.now() +
                "-" +
                Math.round(
                    Math.random() * 1E9
                ) +
                path.extname(
                    file.originalname
                );

            cb(
                null,
                filename
            );

        }

    });


const productUpload =
    multer({

        storage:
            productStorage,

        limits: {

            fileSize:
                5 * 1024 * 1024,

            files: 5

        },

        fileFilter:
            (req, file, cb) => {

                const allowed = [

                    "image/jpeg",
                    "image/jpg",
                    "image/png",
                    "image/webp"

                ];

                if (
                    allowed.includes(
                        file.mimetype
                    )
                ) {

                    return cb(
                        null,
                        true
                    );

                }

                cb(
                    new Error(
                        "Only JPG, JPEG, PNG and WEBP images are allowed."
                    )
                );

            }

    });


// ==================================================
// SETTINGS MULTER
// ==================================================

const settingsStorage =
    multer.diskStorage({

        destination:
            (req, file, cb) => {

                const dir =
                    path.join(
                        __dirname,
                        "../public/uploads/settings"
                    );

                if (
                    !fs.existsSync(dir)
                ) {

                    fs.mkdirSync(
                        dir,
                        {
                            recursive: true
                        }
                    );

                }

                cb(null, dir);

            },

        filename:
            (req, file, cb) => {

                const ext =
                    path
                        .extname(
                            file.originalname
                        )
                        .toLowerCase();

                const filename =
                    Date.now() +
                    "-" +
                    Math.round(
                        Math.random() * 1E9
                    ) +
                    ext;

                cb(
                    null,
                    filename
                );

            }

    });


const settingsUpload =
    multer({

        storage:
            settingsStorage,

        limits: {

            fileSize:
                5 * 1024 * 1024,

            files: 3

        },

        fileFilter:
            (req, file, cb) => {

                const allowed = [

                    "image/jpeg",
                    "image/jpg",
                    "image/png",
                    "image/webp"

                ];

                if (
                    allowed.includes(
                        file.mimetype
                    )
                ) {

                    return cb(
                        null,
                        true
                    );

                }

                cb(
                    new Error(
                        "Only JPG, JPEG, PNG and WEBP images are allowed."
                    )
                );

            }

    });


// ==================================================
// ADMIN ROOT
// ==================================================

router.get(
    "/",
    adminAuth,
    (req, res) => {

        res.redirect(
            "/admin/dashboard"
        );

    }
);


// ==================================================
// LOGIN
// ==================================================

router.get(
    "/login",
    (req, res) => {

        if (
            req.session?.adminId
        ) {

            return res.redirect(
                "/admin/dashboard"
            );

        }

        res.render(
            "admin/login",
            {
                title: "Admin Login",

                error:
                    req.query.error ||
                    ""
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
                    req.body.email ||
                    ""
                )
                .trim()
                .toLowerCase();

            const password =
                req.body.password;

            if (
                !email ||
                !password
            ) {

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
                !(
                    await bcrypt.compare(
                        password,
                        admin.password
                    )
                )
            ) {

                return res.redirect(
                    "/admin/login?error=Invalid+email+or+password"
                );

            }

            req.session.adminId =
                admin._id;

            req.session.adminEmail =
                admin.email;

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


router.get(
    "/logout",
    req => {

        req.session.destroy(
            error => {

                if (error) {

                    console.error(
                        "Admin logout error:",
                        error
                    );

                }

                req.res.redirect(
                    "/admin/login"
                );

            }
        );

    }
);


// ==================================================
// DASHBOARD
// ==================================================

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
                contactCount

            ] =
                await Promise.all([

                    Product.countDocuments(),

                    Review.countDocuments(),

                    Feedback.countDocuments(),

                    Visitor.countDocuments(),

                    Wishlist.countDocuments(),

                    Contact.countDocuments()

                ]);


            const [

                recentProducts,
                recentReviews,
                recentFeedback,
                recentContacts

            ] =
                await Promise.all([

                    Product.find({})
                        .sort({
                            createdAt: -1
                        })
                        .limit(5),

                    Review.find({})
                        .sort({
                            createdAt: -1
                        })
                        .limit(5),

                    Feedback.find({})
                        .sort({
                            createdAt: -1
                        })
                        .limit(5),

                    Contact.find({})
                        .sort({
                            createdAt: -1
                        })
                        .limit(5)

                ]);


            res.render(
                "admin/dashboard",
                {

                    title:
                        "Admin Dashboard",

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
                "Dashboard error:",
                error
            );

            res.status(500).send(
                "Server Error"
            );

        }

    }
);


// ==================================================
// VISITORS
// ==================================================

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


            res.render(
                "admin/visitors",
                {

                    title:
                        "Visitor Analytics",

                    pageCss:
                        "/css/admin/visitors.css",

                    pageJs:
                        "/js/admin/visitors.js",

                    visitors

                }
            );


        } catch (error) {

            console.error(
                "Visitors fetch error:",
                error
            );

            res.status(500).send(
                "Server Error"
            );

        }

    }
);


router.post(
    "/visitors/delete/:id",
    adminAuth,
    async (req, res) => {

        try {

            if (
                validId(
                    req.params.id
                )
            ) {

                await Visitor.findByIdAndDelete(
                    req.params.id
                );

            }

        } catch (error) {

            console.error(
                "Visitor delete error:",
                error
            );

        }

        res.redirect(
            "/admin/visitors"
        );

    }
);


// ==================================================
// PRODUCTS
// ==================================================

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


            res.render(
                "admin/products",
                {

                    title:
                        "Product Management",

                    pageCss:
                        "/css/admin/products.css",

                    pageJs:
                        "/js/admin/products.js",

                    products,

                    success:
                        req.query.success ||
                        "",

                    error:
                        req.query.error ||
                        ""

                }
            );


        } catch (error) {

            console.error(
                "Products fetch error:",
                error
            );

            res.status(500).send(
                "Server Error"
            );

        }

    }
);


// ==================================================
// ADD PRODUCT PAGE
// ==================================================

router.get(
    "/products/add",
    adminAuth,
    (req, res) => {

        res.render(
            "admin/add-product",
            {

                title:
                    "Add Product",

                pageCss:
                    "/css/admin/add-product.css",

                pageJs:
                    "/js/admin/add-product.js",

                error:
                    req.query.error ||
                    ""

            }
        );

    }
);


// ==================================================
// ADD PRODUCT
// ==================================================

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
                fabric,
                technique,
                color,
                dimensions,
                availability

            } = req.body;


            // --------------------------------------------------
            // FEATURED PRODUCT
            // --------------------------------------------------
            // Checkbox checked:
            // req.body.featured = "true"
            //
            // Checkbox unchecked:
            // req.body.featured = undefined
            //
            // Therefore:
            // true  = checked
            // false = unchecked
            // --------------------------------------------------

            const featured =
                req.body.featured === "true" ||
                req.body.featured === "on" ||
                req.body.featured === true;


            const product =
                new Product({

                    name:
                        String(
                            name ||
                            ""
                        ).trim(),

                    category:
                        String(
                            category ||
                            ""
                        ).trim(),

                    description:
                        String(
                            description ||
                            ""
                        ).trim(),

                    price:
                        price,

                    fabric:
                        String(
                            fabric ||
                            ""
                        ).trim(),

                    technique:
                        String(
                            technique ||
                            ""
                        ).trim(),

                    color:
                        String(
                            color ||
                            ""
                        ).trim(),

                    dimensions:
                        String(
                            dimensions ||
                            ""
                        ).trim(),

                    availability:
                        availability ||
                        "In Stock",

                    featured:
                        featured,

                    images:
                        imagePaths(
                            req.files
                        )

                });


            await product.save();


            console.log(
                "PRODUCT ADDED:",
                {
                    id:
                        product._id,

                    name:
                        product.name,

                    featured:
                        product.featured
                }
            );


            res.redirect(
                "/admin/products?success=Product+added+successfully"
            );


        } catch (error) {

            console.error(
                "Add product error:",
                error
            );


            deleteUploadedFiles(
                req.files
            );


            res.redirect(
                "/admin/products?error=Unable+to+add+product"
            );

        }

    }
);


// ==================================================
// EDIT PRODUCT PAGE
// ==================================================

router.get(
    "/products/edit/:id",
    adminAuth,
    async (req, res) => {

        try {

            const { id } =
                req.params;


            if (
                !validId(id)
            ) {

                return res.redirect(
                    "/admin/products?error=Invalid+product+ID"
                );

            }


            const product =
                await Product.findById(id);


            if (!product) {

                return res.redirect(
                    "/admin/products?error=Product+not+found"
                );

            }


            res.render(
                "admin/edit-product",
                {

                    title:
                        "Edit Product",

                    pageCss:
                        "/css/admin/edit-product.css",

                    pageJs:
                        "/js/admin/edit-product.js",

                    product,

                    error:
                        req.query.error ||
                        "",

                    success:
                        req.query.success ||
                        ""

                }
            );


        } catch (error) {

            console.error(
                "Edit product page error:",
                error
            );


            res.redirect(
                "/admin/products?error=Server+error"
            );

        }

    }
);


// ==================================================
// EDIT PRODUCT
// ==================================================

router.post(
    "/products/edit/:id",
    adminAuth,
    productUpload.array(
        "productImages",
        5
    ),
    async (req, res) => {

        try {

            const { id } =
                req.params;


            if (
                !validId(id)
            ) {

                deleteUploadedFiles(
                    req.files
                );


                return res.redirect(
                    "/admin/products?error=Invalid+product+ID"
                );

            }


            const product =
                await Product.findById(id);


            if (!product) {

                deleteUploadedFiles(
                    req.files
                );


                return res.redirect(
                    "/admin/products?error=Product+not+found"
                );

            }


            const {

                name,
                category,
                description,
                price,
                fabric,
                technique,
                color,
                dimensions,
                availability

            } = req.body;


            // --------------------------------------------------
            // CATEGORY SAFETY
            // --------------------------------------------------

            const submittedCategory =
                String(
                    category ||
                    ""
                ).trim();


            const existingCategory =
                String(
                    product.category ||
                    ""
                ).trim();


            const finalCategory =
                submittedCategory ||
                existingCategory;


            if (!finalCategory) {

                deleteUploadedFiles(
                    req.files
                );


                return res.redirect(
                    "/admin/products?error=Product+category+is+required"
                );

            }


            // --------------------------------------------------
            // FEATURED PRODUCT
            // --------------------------------------------------

            const featured =
                req.body.featured === "true" ||
                req.body.featured === "on" ||
                req.body.featured === true;


            Object.assign(
                product,
                {

                    name:
                        String(
                            name ||
                            ""
                        ).trim(),

                    category:
                        finalCategory,

                    description:
                        String(
                            description ||
                            ""
                        ).trim(),

                    price,

                    fabric:
                        String(
                            fabric ||
                            ""
                        ).trim(),

                    technique:
                        String(
                            technique ||
                            ""
                        ).trim(),

                    color:
                        String(
                            color ||
                            ""
                        ).trim(),

                    dimensions:
                        String(
                            dimensions ||
                            ""
                        ).trim(),

                    availability:
                        availability ||
                        "In Stock",

                    featured:
                        featured

                }
            );


            // --------------------------------------------------
            // NEW IMAGES
            // --------------------------------------------------

            const newImages =
                imagePaths(
                    req.files
                );


            if (
                newImages.length
            ) {

                (product.images || [])
                    .forEach(
                        deleteImageFile
                    );


                product.images =
                    newImages;

            }


            await product.save();


            console.log(
                "PRODUCT UPDATED:",
                {
                    id:
                        product._id,

                    name:
                        product.name,

                    featured:
                        product.featured
                }
            );


            res.redirect(
                "/admin/products?success=Product+updated+successfully"
            );


        } catch (error) {

            console.error(
                "Update product error:",
                error
            );


            deleteUploadedFiles(
                req.files
            );


            res.redirect(
                "/admin/products?error=Unable+to+update+product"
            );

        }

    }
);


// ==================================================
// DELETE PRODUCT
// ==================================================

router.post(
    "/products/delete/:id",
    adminAuth,
    async (req, res) => {

        try {

            const { id } =
                req.params;


            if (
                !validId(id)
            ) {

                return res.redirect(
                    "/admin/products?error=Invalid+product+ID"
                );

            }


            const product =
                await Product.findById(id);


            if (!product) {

                return res.redirect(
                    "/admin/products?error=Product+not+found"
                );

            }


            (product.images || [])
                .forEach(
                    deleteImageFile
                );


            await Product.findByIdAndDelete(
                id
            );


            await Review.deleteMany({
                product: id
            });


            await Wishlist.deleteMany({
                product: id
            });


            res.redirect(
                "/admin/products?success=Product+deleted+successfully"
            );


        } catch (error) {

            console.error(
                "Delete product error:",
                error
            );


            res.redirect(
                "/admin/products?error=Unable+to+delete+product"
            );

        }

    }
);


// ==================================================
// REVIEWS
// ==================================================
//
// Review business logic:
// controllers/reviewController.js
// ==================================================

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


// ==================================================
// WISHLISTS
// ==================================================

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


            res.render(
                "admin/wishlists",
                {

                    title:
                        "Wishlist Management",

                    wishlists

                }
            );


        } catch (error) {

            console.error(
                "Wishlists fetch error:",
                error
            );


            res.status(500).send(
                "Server Error"
            );

        }

    }
);


// ==================================================
// FEEDBACK MANAGEMENT
// ==================================================
//
// IMPORTANT:
// Feedback business logic is now inside:
// controllers/feedbackController.js
//
// This route file only handles:
// URL + middleware + controller call.
// ==================================================


// --------------------------------------------------
// GET FEEDBACK
// GET /admin/feedback
// --------------------------------------------------

router.get(
    "/feedback",
    adminAuth,
    feedbackController.getAdminFeedback
);


// --------------------------------------------------
// UPDATE FEEDBACK STATUS
// POST /admin/feedback/status/:id
// --------------------------------------------------

router.post(
    "/feedback/status/:id",
    adminAuth,
    feedbackController.updateFeedbackStatus
);


// --------------------------------------------------
// DELETE FEEDBACK
// POST /admin/feedback/delete/:id
// --------------------------------------------------

router.post(
    "/feedback/delete/:id",
    adminAuth,
    feedbackController.deleteFeedback
);


// ==================================================
// CONTACTS
// ==================================================

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


            res.render(
                "admin/contacts",
                {

                    title:
                        "Contact & Inquiries",

                    pageCss:
                        "/css/admin/contacts.css",

                    pageJs:
                        "/js/admin/contacts.js",

                    contacts,

                    success:
                        req.query.success ||
                        "",

                    error:
                        req.query.error ||
                        ""

                }
            );


        } catch (error) {

            console.error(
                "Admin contacts fetch error:",
                error
            );


            res.status(500).send(
                "Server Error"
            );

        }

    }
);


// ==================================================
// CONTACT STATUS
// ==================================================

router.post(
    "/contacts/status/:id",
    adminAuth,
    async (req, res) => {

        try {

            const { id } =
                req.params;


            const status =
                String(
                    req.body.status ||
                    ""
                )
                .trim()
                .toLowerCase();


            const allowed = [

                "unread",
                "read",
                "replied"

            ];


            if (
                !validId(id)
            ) {

                return res.redirect(
                    "/admin/contacts?error=Invalid+contact+ID"
                );

            }


            if (
                !allowed.includes(
                    status
                )
            ) {

                return res.redirect(
                    "/admin/contacts?error=Invalid+contact+status"
                );

            }


            const contact =
                await Contact.findById(id);


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


            res.redirect(
                "/admin/contacts?success=Contact+status+updated+successfully"
            );


        } catch (error) {

            console.error(
                "Contact status update error:",
                error
            );


            res.redirect(
                "/admin/contacts?error=Unable+to+update+contact+status"
            );

        }

    }
);


// ==================================================
// MARK CONTACT READ
// ==================================================

router.post(
    "/contacts/read/:id",
    adminAuth,
    async (req, res) => {

        try {

            const contact =
                validId(
                    req.params.id
                )
                    ? await Contact.findById(
                        req.params.id
                    )
                    : null;


            if (!contact) {

                return res.redirect(
                    "/admin/contacts?error=Contact+not+found"
                );

            }


            contact.isRead =
                true;


            if (
                !contact.status ||
                contact.status === "unread"
            ) {

                contact.status =
                    "read";

            }


            await contact.save();


            res.redirect(
                "/admin/contacts?success=Contact+marked+as+read"
            );


        } catch (error) {

            console.error(
                "Mark contact read error:",
                error
            );


            res.redirect(
                "/admin/contacts?error=Unable+to+mark+contact+as+read"
            );

        }

    }
);


// ==================================================
// MARK CONTACT UNREAD
// ==================================================

router.post(
    "/contacts/unread/:id",
    adminAuth,
    async (req, res) => {

        try {

            const contact =
                validId(
                    req.params.id
                )
                    ? await Contact.findById(
                        req.params.id
                    )
                    : null;


            if (!contact) {

                return res.redirect(
                    "/admin/contacts?error=Contact+not+found"
                );

            }


            contact.isRead =
                false;

            contact.isReplied =
                false;

            contact.status =
                "unread";


            await contact.save();


            res.redirect(
                "/admin/contacts?success=Contact+marked+as+unread"
            );


        } catch (error) {

            console.error(
                "Mark contact unread error:",
                error
            );


            res.redirect(
                "/admin/contacts?error=Unable+to+mark+contact+as+unread"
            );

        }

    }
);


// ==================================================
// DELETE CONTACT
// ==================================================

router.post(
    "/contacts/delete/:id",
    adminAuth,
    async (req, res) => {

        try {

            if (
                !validId(
                    req.params.id
                )
            ) {

                return res.redirect(
                    "/admin/contacts?error=Invalid+contact+ID"
                );

            }


            const deleted =
                await Contact.findByIdAndDelete(
                    req.params.id
                );


            if (!deleted) {

                return res.redirect(
                    "/admin/contacts?error=Contact+not+found"
                );

            }


            res.redirect(
                "/admin/contacts?success=Contact+deleted+successfully"
            );


        } catch (error) {

            console.error(
                "Contact delete error:",
                error
            );


            res.redirect(
                "/admin/contacts?error=Unable+to+delete+contact"
            );

        }

    }
);


// ==================================================
// SETTINGS - GET
// ==================================================

router.get(
    "/settings",
    adminAuth,
    async (req, res) => {

        try {

            let settings =
                await Settings.findOne();


            if (!settings) {

                settings =
                    await Settings.create({});

            }


            res.render(
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
                        req.query.success ||
                        "",

                    error:
                        req.query.error ||
                        ""

                }
            );


        } catch (error) {

            console.error(
                "Admin settings page error:",
                error
            );


            res.status(500).send(
                "Unable to load admin settings."
            );

        }

    }
);


// ==================================================
// SETTINGS - POST
// ==================================================

router.post(
    "/settings",
    adminAuth,
    settingsUpload.fields([

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
                "faviconFile",

            maxCount: 1
        }

    ]),
    async (req, res) => {

        try {

            const clean =
                value =>
                    String(
                        value || ""
                    ).trim();


            const {

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

                address,

                whatsapp,
                instagram,
                facebook,
                youtube,

                maintenanceMode,
                showContact,
                showFeedback,
                showReviews

            } = req.body;


            let settings =
                await Settings.findOne();


            if (!settings) {

                settings =
                    new Settings();

            }


            const data = {

                siteName:
                    clean(siteName),

                siteDescription:
                    clean(siteDescription),

                siteEmail:
                    clean(
                        siteEmail
                    ).toLowerCase(),

                sitePhone:
                    clean(sitePhone),

                metaTitle:
                    clean(metaTitle),

                metaDescription:
                    clean(
                        metaDescription
                    ),

                metaKeywords:
                    clean(metaKeywords),

                faviconUrl:
                    clean(faviconUrl),

                heroHeading:
                    clean(heroHeading),

                heroDescription:
                    clean(
                        heroDescription
                    ),

                heroImage:
                    clean(heroImage),

                aboutHeading:
                    clean(aboutHeading),

                aboutDescription:
                    clean(
                        aboutDescription
                    ),

                aboutImage:
                    clean(aboutImage),

                address:
                    clean(address),

                whatsapp:
                    clean(whatsapp),

                instagram:
                    clean(instagram),

                facebook:
                    clean(facebook),

                youtube:
                    clean(youtube),

                maintenanceMode:
                    maintenanceMode === "on",

                showContact:
                    showContact === "on",

                showFeedback:
                    showFeedback === "on",

                showReviews:
                    showReviews === "on"

            };


            if (!data.siteName) {

                deleteSettingsFiles(
                    req.files
                );


                return res.redirect(
                    "/admin/settings?error=Website+name+is+required"
                );

            }


            if (
                data.siteName.length >
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
                data.siteDescription.length >
                500
            ) {

                deleteSettingsFiles(
                    req.files
                );


                return res.redirect(
                    "/admin/settings?error=Website+description+is+too+long"
                );

            }


            if (data.siteEmail) {

                const emailRegex =
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


                if (
                    !emailRegex.test(
                        data.siteEmail
                    )
                ) {

                    deleteSettingsFiles(
                        req.files
                    );


                    return res.redirect(
                        "/admin/settings?error=Please+enter+a+valid+email"
                    );

                }

            }


            if (
                data.sitePhone.length >
                30
            ) {

                deleteSettingsFiles(
                    req.files
                );


                return res.redirect(
                    "/admin/settings?error=Phone+number+is+too+long"
                );

            }


            if (
                data.address.length >
                500
            ) {

                deleteSettingsFiles(
                    req.files
                );


                return res.redirect(
                    "/admin/settings?error=Address+is+too+long"
                );

            }


            // ==================================================
            // HERO IMAGE
            // ==================================================

            const newHeroFile =
                req.files
                    ?.heroImageFile
                    ?.[0];


            if (newHeroFile) {

                const oldHeroImage =
                    settings.heroImage;


                data.heroImage =
                    "/uploads/settings/" +
                    newHeroFile.filename;


                if (
                    oldHeroImage &&
                    oldHeroImage !==
                        data.heroImage
                ) {

                    deleteImageFile(
                        oldHeroImage
                    );

                }

            } else {

                data.heroImage =
                    clean(
                        heroImage ||
                        settings.heroImage
                    );

            }


            // ==================================================
            // ABOUT IMAGE
            // ==================================================

            const newAboutFile =
                req.files
                    ?.aboutImageFile
                    ?.[0];


            if (newAboutFile) {

                const oldAboutImage =
                    settings.aboutImage;


                data.aboutImage =
                    "/uploads/settings/" +
                    newAboutFile.filename;


                if (
                    oldAboutImage &&
                    oldAboutImage !==
                        data.aboutImage
                ) {

                    deleteImageFile(
                        oldAboutImage
                    );

                }

            } else {

                data.aboutImage =
                    clean(
                        aboutImage ||
                        settings.aboutImage
                    );

            }


            // ==================================================
            // FAVICON
            // ==================================================

            const newFaviconFile =
                req.files
                    ?.faviconFile
                    ?.[0];


            if (newFaviconFile) {

                const oldFavicon =
                    settings.faviconUrl;


                data.faviconUrl =
                    "/uploads/settings/" +
                    newFaviconFile.filename;


                if (
                    oldFavicon &&
                    oldFavicon !==
                        data.faviconUrl
                ) {

                    deleteImageFile(
                        oldFavicon
                    );

                }

            } else {

                data.faviconUrl =
                    clean(
                        faviconUrl ||
                        settings.faviconUrl
                    );

            }


            Object.assign(
                settings,
                data
            );


            await settings.save();


            console.log(
                "Settings saved:",
                settings._id
            );


            res.redirect(
                "/admin/settings?success=Settings+saved+successfully"
            );


        } catch (error) {

            console.error(
                "Admin settings update error:",
                error
            );


            deleteSettingsFiles(
                req.files
            );


            res.redirect(
                "/admin/settings?error=Unable+to+save+settings"
            );

        }

    }
);


// ==================================================
// CREATE FIRST ADMIN
// ==================================================

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
                process.env.ADMIN_EMAIL;


            const password =
                process.env.ADMIN_PASSWORD;


            if (
                !email ||
                !password
            ) {

                return res.status(
                    500
                ).send(
                    "ADMIN_EMAIL or ADMIN_PASSWORD is missing in .env"
                );

            }


            const admin =
                new Admin({

                    email:
                        email
                            .trim()
                            .toLowerCase(),

                    password:
                        await bcrypt.hash(
                            password,
                            10
                        )

                });


            await admin.save();


            res.send(
                "First admin created successfully. You can now login."
            );


        } catch (error) {

            console.error(
                "Create first admin error:",
                error
            );


            res.status(
                500
            ).send(
                "Unable to create first admin."
            );

        }

    }
);


// ==================================================
// EXPORT
// ==================================================

module.exports = router;

