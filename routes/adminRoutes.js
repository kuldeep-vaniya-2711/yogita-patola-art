const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const router = express.Router();

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

        if (!imagePath) return;

        const cleanPath =
            String(imagePath).replace(/^\/+/, "");

        const fullPath = path.join(
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

    (files || []).forEach(file =>
        deleteImageFile(
            "/uploads/products/" +
            file.filename
        )
    );
};


const deleteSettingsFiles = files => {

    if (!files) return;

    Object.values(files)
        .flat()
        .forEach(file =>
            deleteImageFile(
                "/uploads/settings/" +
                file.filename
            )
        );
};


// =========================================================
// MULTER STORAGE
// =========================================================

function createStorage(subfolder) {

    return multer.diskStorage({

        destination: (req, file, cb) => {

            const dir = path.join(
                __dirname,
                "../public/uploads",
                subfolder
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

            const ext =
                path.extname(
                    file.originalname
                ).toLowerCase();

            cb(
                null,
                `${Date.now()}-${Math.round(
                    Math.random() * 1e9
                )}${ext}`
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

    if (
        allowed.includes(
            file.mimetype
        )
    ) {

        return cb(null, true);
    }

    cb(
        new Error(
            "Only JPG, JPEG, PNG and WEBP images are allowed."
        )
    );
};


const productUpload = multer({

    storage:
        createStorage("products"),

    limits: {

        fileSize:
            5 * 1024 * 1024,

        files: 5
    },

    fileFilter
});


const settingsUpload = multer({

    storage:
        createStorage("settings"),

    limits: {

        fileSize:
            5 * 1024 * 1024,

        // 8 setting images
        files: 8
    },

    fileFilter
});


// =========================================================
// ADMIN ROOT & AUTH
// =========================================================

router.get(
    "/",
    adminAuth,
    (req, res) =>
        res.redirect(
            "/admin/dashboard"
        )
);


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
                error:
                    req.query.error || ""
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

            return res.render(
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

            return res
                .status(500)
                .send(
                    "Server Error"
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

            return res
                .status(500)
                .send(
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

        return res.redirect(
            "/admin/visitors"
        );
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
                        "Product Management",

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
                "Products fetch error:",
                error
            );

            return res
                .status(500)
                .send(
                    "Server Error"
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
                fabric,
                technique,
                color,
                dimensions,
                availability
            } = req.body;

            const featured =
                req.body.featured ===
                    "true" ||
                req.body.featured ===
                    "on" ||
                req.body.featured === true;

            const product =
                new Product({

                    name:
                        String(
                            name || ""
                        ).trim(),

                    category:
                        String(
                            category || ""
                        ).trim(),

                    description:
                        String(
                            description || ""
                        ).trim(),

                    price,

                    fabric:
                        String(
                            fabric || ""
                        ).trim(),

                    technique:
                        String(
                            technique || ""
                        ).trim(),

                    color:
                        String(
                            color || ""
                        ).trim(),

                    dimensions:
                        String(
                            dimensions || ""
                        ).trim(),

                    availability:
                        availability ||
                        "In Stock",

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

            return res.redirect(
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

            return res.redirect(
                "/admin/products?error=Unable+to+add+product"
            );
        }
    }
);


router.get(
    "/products/edit/:id",
    adminAuth,
    async (req, res) => {

        try {

            const { id } =
                req.params;

            if (!validId(id)) {

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

            return res.render(
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
                        req.query.error || "",

                    success:
                        req.query.success || ""
                }
            );

        } catch (error) {

            console.error(
                "Edit product page error:",
                error
            );

            return res.redirect(
                "/admin/products?error=Server+error"
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

            const { id } =
                req.params;

            if (!validId(id)) {

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

            const finalCategory =
                String(
                    category || ""
                ).trim() ||
                String(
                    product.category || ""
                ).trim();

            if (!finalCategory) {

                deleteUploadedFiles(
                    req.files
                );

                return res.redirect(
                    "/admin/products?error=Product+category+is+required"
                );
            }

            const featured =
                req.body.featured ===
                    "true" ||
                req.body.featured ===
                    "on" ||
                req.body.featured === true;

            Object.assign(
                product,
                {

                    name:
                        String(
                            name || ""
                        ).trim(),

                    category:
                        finalCategory,

                    description:
                        String(
                            description || ""
                        ).trim(),

                    price,

                    fabric:
                        String(
                            fabric || ""
                        ).trim(),

                    technique:
                        String(
                            technique || ""
                        ).trim(),

                    color:
                        String(
                            color || ""
                        ).trim(),

                    dimensions:
                        String(
                            dimensions || ""
                        ).trim(),

                    availability:
                        availability ||
                        "In Stock",

                    featured
                }
            );

            const newImages =
                imagePaths(
                    req.files
                );

            if (newImages.length) {

                (
                    product.images || []
                ).forEach(
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

            return res.redirect(
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

            return res.redirect(
                "/admin/products?error=Unable+to+update+product"
            );
        }
    }
);


router.post(
    "/products/delete/:id",
    adminAuth,
    async (req, res) => {

        try {

            const { id } =
                req.params;

            if (!validId(id)) {

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

            (
                product.images || []
            ).forEach(
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

            return res.redirect(
                "/admin/products?success=Product+deleted+successfully"
            );

        } catch (error) {

            console.error(
                "Delete product error:",
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

                    wishlists
                }
            );

        } catch (error) {

            console.error(
                "Wishlists fetch error:",
                error
            );

            return res
                .status(500)
                .send(
                    "Server Error"
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
                        "Contact & Inquiries",

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
                "Admin contacts fetch error:",
                error
            );

            return res
                .status(500)
                .send(
                    "Server Error"
                );
        }
    }
);


router.post(
    "/contacts/status/:id",
    adminAuth,
    async (req, res) => {

        try {

            const { id } =
                req.params;

            const status =
                String(
                    req.body.status || ""
                )
                    .trim()
                    .toLowerCase();

            const allowed = [
                "unread",
                "read",
                "replied"
            ];

            if (!validId(id)) {

                return res.redirect(
                    "/admin/contacts?error=Invalid+contact+ID"
                );
            }

            if (
                !allowed.includes(status)
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

            return res.redirect(
                "/admin/contacts?success=Contact+status+updated+successfully"
            );

        } catch (error) {

            console.error(
                "Contact status update error:",
                error
            );

            return res.redirect(
                "/admin/contacts?error=Unable+to+update+contact+status"
            );
        }
    }
);


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

            contact.isRead = true;

            if (
                !contact.status ||
                contact.status ===
                    "unread"
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
                "Mark contact read error:",
                error
            );

            return res.redirect(
                "/admin/contacts?error=Unable+to+mark+contact+as+read"
            );
        }
    }
);


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

            return res.redirect(
                "/admin/contacts?success=Contact+marked+as+unread"
            );

        } catch (error) {

            console.error(
                "Mark contact unread error:",
                error
            );

            return res.redirect(
                "/admin/contacts?error=Unable+to+mark+contact+as+unread"
            );
        }
    }
);


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
                    await Settings.create({});
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

            return res
                .status(500)
                .send(
                    "Unable to load admin settings."
                );
        }
    }
);


// =========================================================
// SETTINGS IMAGE FIELDS
// =========================================================

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


// =========================================================
// SAVE SETTINGS
// =========================================================

router.post(
    "/settings",
    adminAuth,
    settingsUpload.fields(
        settingsFields
    ),
    async (req, res) => {

        try {

            const clean = value =>
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
            } = req.body;


            let settings =
                await Settings.findOne();


            if (!settings) {

                settings =
                    new Settings();
            }


            const isChecked =
                value =>
                    value === "true" ||
                    value === "on" ||
                    value === true;


            const data = {

                siteName:
                    clean(siteName),

                siteDescription:
                    clean(
                        siteDescription
                    ),

                siteEmail:
                    clean(
                        siteEmail
                    ).toLowerCase(),

                sitePhone:
                    clean(
                        sitePhone
                    ),

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
                    clean(
                        aboutHeading
                    ),

                aboutDescription:
                    clean(
                        aboutDescription
                    ),

                aboutImage:
                    clean(aboutImage),

                aboutStoryImage:
                    clean(
                        aboutStoryImage
                    ),

                aboutArtImage:
                    clean(
                        aboutArtImage
                    ),

                heritageHandcraftedImage:
                    clean(
                        heritageHandcraftedImage
                    ),

                heritageIntricateImage:
                    clean(
                        heritageIntricateImage
                    ),

                heritageTimelessImage:
                    clean(
                        heritageTimelessImage
                    ),

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
                    isChecked(
                        maintenanceMode
                    ),

                showContact:
                    isChecked(
                        showContact
                    ),

                showFeedback:
                    isChecked(
                        showFeedback
                    ),

                showReviews:
                    isChecked(
                        showReviews
                    )
            };


            // =================================================
            // VALIDATION
            // =================================================

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


            if (
                data.siteEmail &&
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
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


            // =================================================
            // IMAGE UPLOAD / REPLACEMENT
            // =================================================

            const imageKeys = [

                {
                    field:
                        "heroImageFile",

                    prop:
                        "heroImage"
                },

                {
                    field:
                        "aboutImageFile",

                    prop:
                        "aboutImage"
                },

                {
                    field:
                        "aboutStoryImageFile",

                    prop:
                        "aboutStoryImage"
                },

                {
                    field:
                        "aboutArtImageFile",

                    prop:
                        "aboutArtImage"
                },

                {
                    field:
                        "faviconFile",

                    prop:
                        "faviconUrl"
                },

                {
                    field:
                        "heritageHandcraftedImageFile",

                    prop:
                        "heritageHandcraftedImage"
                },

                {
                    field:
                        "heritageIntricateImageFile",

                    prop:
                        "heritageIntricateImage"
                },

                {
                    field:
                        "heritageTimelessImageFile",

                    prop:
                        "heritageTimelessImage"
                }
            ];


            for (
                const {
                    field,
                    prop
                } of imageKeys
            ) {

                const uploadedFile =
                    req.files?.[field]?.[0];


                if (uploadedFile) {

                    const oldImage =
                        settings[prop];


                    data[prop] =
                        "/uploads/settings/" +
                        uploadedFile.filename;


                    if (
                        oldImage &&
                        oldImage !==
                            data[prop]
                    ) {

                        deleteImageFile(
                            oldImage
                        );
                    }

                } else {

                    data[prop] =
                        clean(
                            req.body[prop] ||
                            settings[prop]
                        );
                }
            }


            // =================================================
            // SAVE
            // =================================================

            Object.assign(
                settings,
                data
            );


            await settings.save();


            console.log(
                "Settings saved:",
                settings._id
            );


            console.log(
                "Website Status:",
                {
                    maintenanceMode:
                        settings.maintenanceMode,

                    showContact:
                        settings.showContact,

                    showFeedback:
                        settings.showFeedback,

                    showReviews:
                        settings.showReviews
                }
            );


            return res.redirect(
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

            return res.redirect(
                "/admin/settings?error=Unable+to+save+settings"
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
                process.env.ADMIN_EMAIL;

            const password =
                process.env.ADMIN_PASSWORD;


            if (
                !email ||
                !password
            ) {

                return res
                    .status(500)
                    .send(
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


            return res.send(
                "First admin created successfully. You can now login."
            );

        } catch (error) {

            console.error(
                "Create first admin error:",
                error
            );

            return res
                .status(500)
                .send(
                    "Unable to create first admin."
                );
        }
    }
);


module.exports = router;