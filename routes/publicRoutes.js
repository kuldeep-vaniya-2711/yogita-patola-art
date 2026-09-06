const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const Product = require("../models/Product");
const Review = require("../models/Review");
const Feedback = require("../models/Feedback");
const Contact = require("../models/Contact");
const Settings = require("../models/Settings");
const Wishlist = require("../models/Wishlist");


// ==================================================
// SETTINGS
// ==================================================

async function getSettings() {

    try {

        let settings =
            await Settings.findOne();


        if (!settings) {

            settings =
                await Settings.create({});

        }


        return settings;

    } catch (error) {

        console.error(
            "Settings error:",
            error
        );

        return null;
    }
}


// ==================================================
// GLOBAL PUBLIC MIDDLEWARE
// ==================================================

router.use(async (req, res, next) => {

    try {

        const settings =
            await getSettings();


        // ==================================================
        // WEBSITE SETTINGS
        // ==================================================

        res.locals.websiteSettings =
            settings;


        res.locals.siteName =
            settings?.siteName ||
            "Yogita Patola Art";


        res.locals.siteDescription =
            settings?.siteDescription ||
            "Handcrafted Patola Sarees and Traditional Indian Textiles";


        res.locals.siteEmail =
            settings?.siteEmail ||
            "";


        res.locals.sitePhone =
            settings?.sitePhone ||
            "";


        res.locals.address =
            settings?.address ||
            "";


        res.locals.instagramUrl =
            settings?.instagram ||
            "";


        res.locals.facebookUrl =
            settings?.facebook ||
            "";


        res.locals.youtubeUrl =
            settings?.youtube ||
            "";


        res.locals.emailAddress =
            settings?.siteEmail ||
            "";


        // ==================================================
        // WHATSAPP
        // ==================================================

        const whatsapp =
            String(
                settings?.whatsapp || ""
            ).replace(
                /\D/g,
                ""
            );


        res.locals.whatsappUrl =
            whatsapp
                ? `https://wa.me/${whatsapp}`
                : "";


        // ==================================================
        // PAGE VISIBILITY
        // ==================================================

        res.locals.showContact =
            settings
                ? settings.showContact !== false
                : true;


        res.locals.showFeedback =
            settings
                ? settings.showFeedback !== false
                : true;


        res.locals.showReviews =
            settings
                ? settings.showReviews !== false
                : true;


        // ==================================================
        // MAINTENANCE MODE
        // ==================================================

        const allowedPaths = [

            "/maintenance",

            "/admin",

            "/user",

            "/login",

            "/register"

        ];


        if (

            settings?.maintenanceMode === true &&

            !allowedPaths.some(
                path =>
                    req.path.startsWith(path)
            )

        ) {

            return res.send(`

                <!DOCTYPE html>

                <html lang="en">

                <head>

                    <meta charset="UTF-8">

                    <meta
                        name="viewport"
                        content="width=device-width, initial-scale=1.0"
                    >

                    <title>
                        Under Maintenance
                    </title>

                </head>


                <body style="
                    min-height:100vh;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    text-align:center;
                    font-family:Arial,sans-serif;
                ">


                    <div>

                        <h1>
                            Website Under Maintenance
                        </h1>


                        <p>
                            We are currently improving
                            our website.
                        </p>


                        <p>
                            Please check back soon.
                        </p>

                    </div>


                </body>

                </html>

            `);
        }


        next();

    } catch (error) {

        console.error(
            "Public middleware error:",
            error
        );

        next();
    }
});


// ==================================================
// HOME
// ==================================================

router.get(
    "/",
    async (req, res) => {

        try {

            const featuredProducts =
                await Product
                    .find({
                        featured: true
                    })
                    .sort({
                        createdAt: -1
                    })
                    .limit(6)
                    .lean();


            return res.render(
                "public/home",
                {

                    // ==================================================
                    // PAGE TITLE
                    // ==================================================

                    title:
                        res.locals.siteName,


                    // ==================================================
                    // PAGE DESCRIPTION
                    // ==================================================

                    description:
                        res.locals.siteDescription,


                    // ==================================================
                    // IMPORTANT:
                    // HOMEPAGE CSS
                    // ==================================================

                    pageCss:
                        "/css/pages/home.css",


                    // ==================================================
                    // HOMEPAGE JS
                    // ==================================================

                    pageJs:
                        "/js/pages/home.js",


                    // ==================================================
                    // FEATURED PRODUCTS
                    // ==================================================

                    featuredProducts

                }
            );

        } catch (error) {

            console.error(
                "Home error:",
                error
            );


            return res
                .status(500)
                .send(
                    "Home page error"
                );
        }
    }
);


// ==================================================
// EJS TEST
// ==================================================

router.get(
    "/ejs-test",
    (req, res) => {

        return res.render(
            "public/ejs-test"
        );

    }
);


// ==================================================
// COLLECTIONS
// ==================================================

router.get(
    "/collections",
    async (req, res) => {

        try {

            const products =
                await Product
                    .find({})
                    .sort({
                        createdAt: -1
                    });


            return res.render(
                "public/collections",
                {

                    title:
                        `Collections | ${res.locals.siteName}`,

                    pageCss:
                        "/css/pages/collections.css",

                    products

                }
            );

        } catch (error) {

            console.error(
                "Collections error:",
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


// ==================================================
// PRODUCTS
// ==================================================

router.get(
    "/products",
    async (req, res) => {

        try {

            const products =
                await Product
                    .find({})
                    .sort({
                        createdAt: -1
                    });


            return res.render(
                "public/products",
                {

                    title:
                        `Products | ${res.locals.siteName}`,

                    pageCss:
                        "/css/pages/products.css",

                    products

                }
            );

        } catch (error) {

            console.error(
                "Products error:",
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


// ==================================================
// PRODUCT DETAIL
// ==================================================

router.get(
    "/products/:id",
    async (req, res) => {

        try {

            const {
                id
            } = req.params;


            // ==================================================
            // VALIDATE PRODUCT ID
            // ==================================================

            if (
                !mongoose.Types.ObjectId.isValid(id)
            ) {

                return res
                    .status(404)
                    .send(
                        "Product not found"
                    );
            }


            // ==================================================
            // GET PRODUCT
            // ==================================================

            const product =
                await Product.findById(id);


            if (!product) {

                return res
                    .status(404)
                    .send(
                        "Product not found"
                    );
            }


            // ==================================================
            // GET REVIEWS
            // ==================================================

            const reviews =
                await Review
                    .find({
                        product:
                            product._id
                    })
                    .sort({
                        createdAt: -1
                    });


            // ==================================================
            // RELATED PRODUCTS
            // ==================================================

            const relatedProducts =
                await Product
                    .find({

                        category:
                            product.category,

                        _id: {
                            $ne:
                                product._id
                        }

                    })
                    .limit(4);


            // ==================================================
            // AVERAGE RATING
            // ==================================================

            const averageRating =
                reviews.length
                    ? (
                        reviews.reduce(
                            (
                                sum,
                                review
                            ) =>

                                sum +
                                Number(
                                    review.rating || 0
                                ),

                            0

                        ) /
                        reviews.length

                    ).toFixed(1)

                    : 0;


            // ==================================================
            // WISHLIST STATUS
            // ==================================================

            let isInWishlist =
                false;


            const userId =
                req.session?.userId;


            if (

                userId &&

                mongoose.Types.ObjectId.isValid(
                    userId
                )

            ) {

                isInWishlist =
                    Boolean(

                        await Wishlist
                            .findOne({

                                user:
                                    userId,

                                product:
                                    product._id

                            })
                            .select("_id")

                    );

            }


            // ==================================================
            // RENDER PRODUCT DETAIL
            // ==================================================

            return res.render(
                "public/product-detail",
                {

                    title:
                        `${product.name} | ${res.locals.siteName}`,

                    pageCss:
                        "/css/pages/product-detail.css",

                    pageJs:
                        "/js/pages/product-detail.js",

                    product,

                    reviews,

                    relatedProducts,

                    averageRating,

                    isInWishlist

                }
            );

        } catch (error) {

            console.error(
                "Product detail error:",
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


// ==================================================
// SEARCH
// ==================================================

router.get(
    "/search",
    async (req, res) => {

        try {

            const query =
                String(
                    req.query.q || ""
                ).trim();


            let products = [];


            if (query) {

                const regex = {

                    $regex:
                        query,

                    $options:
                        "i"

                };


                products =
                    await Product
                        .find({

                            $or: [

                                {
                                    name:
                                        regex
                                },

                                {
                                    category:
                                        regex
                                },

                                {
                                    description:
                                        regex
                                },

                                {
                                    fabric:
                                        regex
                                },

                                {
                                    technique:
                                        regex
                                },

                                {
                                    color:
                                        regex
                                }

                            ]

                        })
                        .sort({
                            createdAt: -1
                        });

            }


            return res.render(
                "public/search",
                {

                    title:

                        query

                            ? `Search: ${query}`

                            : `Search | ${res.locals.siteName}`,

                    pageCss:
                        "/css/pages/search.css",

                    query,

                    products

                }
            );

        } catch (error) {

            console.error(
                "Search error:",
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


// ==================================================
// ABOUT
// ==================================================

router.get(
    "/about",
    (req, res) => {

        return res.render(
            "public/about",
            {

                title:
                    `Our Story | ${res.locals.siteName}`,

                pageCss:
                    "/css/pages/about.css"

            }
        );

    }
);


// ==================================================
// CONTACT PAGE
// ==================================================

router.get(
    "/contact",
    (req, res) => {

        if (
            !res.locals.showContact
        ) {

            return res
                .status(404)
                .send(
                    "Contact page is currently unavailable."
                );
        }


        return res.render(
            "public/contact",
            {

                title:
                    `Contact | ${res.locals.siteName}`,

                pageCss:
                    "/css/pages/contact.css",

                success:
                    req.query.success || "",

                error:
                    req.query.error || ""

            }
        );

    }
);


// ==================================================
// CONTACT FORM
// ==================================================

router.post(
    "/contact",
    async (req, res) => {

        try {

            if (
                !res.locals.showContact
            ) {

                return res
                    .status(403)
                    .send(
                        "Contact form is currently unavailable."
                    );
            }


            const {
                name,
                email,
                phone,
                subject,
                message
            } = req.body;


            if (
                !name ||
                !email ||
                !message
            ) {

                return res.redirect(
                    "/contact?error=Please+fill+all+required+fields"
                );
            }


            await Contact.create({

                name:
                    String(name)
                        .trim(),

                email:
                    String(email)
                        .trim()
                        .toLowerCase(),

                phone:
                    String(phone || "")
                        .trim(),

                subject:
                    String(subject || "")
                        .trim(),

                message:
                    String(message)
                        .trim(),

                status:
                    "unread",

                isRead:
                    false

            });


            return res.redirect(
                "/contact?success=Message+sent+successfully"
            );

        } catch (error) {

            console.error(
                "Contact error:",
                error
            );


            return res.redirect(
                "/contact?error=Unable+to+send+message"
            );
        }
    }
);


// ==================================================
// FEEDBACK PAGE
// ==================================================

router.get(
    "/feedback",
    (req, res) => {

        if (
            !res.locals.showFeedback
        ) {

            return res
                .status(404)
                .send(
                    "Feedback page is currently unavailable."
                );
        }


        return res.render(
            "public/feedback",
            {

                title:
                    `Feedback | ${res.locals.siteName}`,

                pageCss:
                    "/css/pages/feedback.css"

            }
        );

    }
);


// ==================================================
// FEEDBACK FORM
// ==================================================

router.post(
    "/feedback",
    async (req, res) => {

        try {

            if (
                !res.locals.showFeedback
            ) {

                return res
                    .status(403)
                    .send(
                        "Feedback is currently unavailable."
                    );
            }


            const {
                name,
                email,
                rating,
                message
            } = req.body;


            if (
                !name ||
                !message
            ) {

                return res.redirect(
                    "/?feedbackError=1#feedback"
                );
            }


            let finalRating =
                null;


            if (rating) {

                const value =
                    Number(rating);


                if (

                    Number.isInteger(value) &&

                    value >= 1 &&

                    value <= 5

                ) {

                    finalRating =
                        value;

                }

            }


            await Feedback.create({

                name:
                    String(name)
                        .trim(),

                email:
                    String(email || "")
                        .trim()
                        .toLowerCase(),

                rating:
                    finalRating,

                message:
                    String(message)
                        .trim()

            });


            return res.redirect(
                "/?feedbackSuccess=1#feedback"
            );

        } catch (error) {

            console.error(
                "Feedback error:",
                error
            );


            return res.redirect(
                "/?feedbackError=1#feedback"
            );
        }
    }
);


// ==================================================
// FEEDBACK STATUS
// ==================================================

router.use(
    (req, res, next) => {

        res.locals.feedbackSuccess =
            req.query.feedbackSuccess === "1";


        res.locals.feedbackError =
            req.query.feedbackError === "1";


        next();

    }
);


// ==================================================
// PUBLIC 404
// ==================================================

router.use(
    (req, res) => {

        console.log(
            "PUBLIC 404:",
            req.method,
            req.originalUrl
        );


        return res
            .status(404)
            .send(`

                <!DOCTYPE html>

                <html lang="en">

                <head>

                    <meta charset="UTF-8">

                    <meta
                        name="viewport"
                        content="width=device-width, initial-scale=1.0"
                    >

                    <title>
                        Page Not Found
                    </title>

                </head>


                <body style="
                    min-height:100vh;
                    display:flex;
                    flex-direction:column;
                    align-items:center;
                    justify-content:center;
                    text-align:center;
                    font-family:Arial,sans-serif;
                ">


                    <h1>
                        404
                    </h1>


                    <h2>
                        Page Not Found
                    </h2>


                    <p>
                        The requested page
                        could not be found.
                    </p>


                    <a href="/">
                        Go Home
                    </a>


                </body>

                </html>

            `);
    }
);


module.exports = router;