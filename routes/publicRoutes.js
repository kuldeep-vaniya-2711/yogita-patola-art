const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Product = require("../models/Product");
const Review = require("../models/Review");
const Feedback = require("../models/Feedback");
const Contact = require("../models/Contact");
const Settings = require("../models/Settings");
const Wishlist = require("../models/Wishlist");


// ==========================================================
// GET WEBSITE SETTINGS
// ==========================================================

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


// ==========================================================
// GLOBAL PUBLIC MIDDLEWARE
// ==========================================================

router.use(async (req, res, next) => {

    try {

        const settings =
            await getSettings();


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
        // WEBSITE VISIBILITY
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
                p =>
                    req.path.startsWith(p)
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


                <body
                    style="
                        min-height:100vh;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        text-align:center;
                        font-family:Arial,sans-serif;
                    "
                >

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


// ==========================================================
// HOME
// ==========================================================

router.get(
    "/",
    async (req, res) => {

        try {

            // ==================================================
            // FEATURED PRODUCTS
            // ==================================================

            const featuredProducts =
                await Product.find({
                    featured: true
                })
                .sort({
                    createdAt: -1
                })
                .limit(6)
                .lean();


            // ==================================================
            // BEST HOME REVIEWS
            //
            // 5-star first
            // Then 4-star
            // Latest first
            // Maximum 3
            // ==================================================

            const homeReviews =
                await Review.find({
                    rating: {
                        $gte: 4
                    }
                })
                .sort({
                    rating: -1,
                    createdAt: -1
                })
                .limit(3)
                .lean();


            // ==================================================
            // RENDER HOME
            // ==================================================

            return res.render(
                "public/home",
                {

                    title:
                        res.locals.siteName,


                    description:
                        res.locals.siteDescription,


                    pageCss:
                        "/css/pages/home.css",


                    pageJs:
                        "/js/pages/home.js",


                    featuredProducts,


                    homeReviews

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


// ==========================================================
// EJS TEST
// ==========================================================

router.get(
    "/ejs-test",
    (req, res) =>
        res.render(
            "public/ejs-test"
        )
);


// ==========================================================
// COLLECTIONS
// ==========================================================

router.get(
    "/collections",
    async (req, res) => {

        try {

            // ==================================================
            // PAGINATION
            // ==================================================

            const PRODUCTS_PER_PAGE = 12;


            let currentPage =
                parseInt(
                    req.query.page,
                    10
                );


            if (
                !Number.isInteger(
                    currentPage
                ) ||
                currentPage < 1
            ) {

                currentPage = 1;
            }


            // ==================================================
            // QUERY VALUES
            // ==================================================

            const search =
                String(
                    req.query.search || ""
                ).trim();


            const category =
                String(
                    req.query.category || ""
                ).trim();


            const sort =
                String(
                    req.query.sort ||
                    "recommended"
                ).trim();


            // ==================================================
            // MONGODB FILTER
            // ==================================================

            const filter = {};


            // ==================================================
            // SEARCH
            // ==================================================

            if (search) {

                const searchRegex = {

                    $regex: search,

                    $options: "i"

                };


                filter.$or = [

                    {
                        name: searchRegex
                    },

                    {
                        category: searchRegex
                    },

                    {
                        description: searchRegex
                    },

                    {
                        fabric: searchRegex
                    },

                    {
                        technique: searchRegex
                    },

                    {
                        color: searchRegex
                    }

                ];
            }


            // ==================================================
            // CATEGORY FILTER
            // ==================================================

            const categoryFilters = {

                "Patola":
                    /Patola/i,

                "Double Ikat":
                    /Double Ikat/i,

                "Single Ikat":
                    /Single Ikat/i,

                "Sarees":
                    /Sarees/i,

                "Dupattas":
                    /^Dupattas$/i,

                "Accessories":
                    /^Accessories$/i

            };


            if (
                category &&
                categoryFilters[category]
            ) {

                filter.category =
                    categoryFilters[category];
            }


            // ==================================================
            // SORTING
            // ==================================================

            let sortOption = {

                featured: -1,

                createdAt: -1

            };


            switch (sort) {

                case "price_asc":

                    sortOption = {

                        price: 1,

                        createdAt: -1

                    };

                    break;


                case "price_desc":

                    sortOption = {

                        price: -1,

                        createdAt: -1

                    };

                    break;


                case "newest":

                    sortOption = {

                        createdAt: -1

                    };

                    break;


                case "recommended":

                default:

                    sortOption = {

                        featured: -1,

                        createdAt: -1

                    };

                    break;

            }


            // ==================================================
            // TOTAL PRODUCTS
            // ==================================================

            const totalProducts =
                await Product.countDocuments(
                    filter
                );


            // ==================================================
            // TOTAL PAGES
            // ==================================================

            const totalPages =
                Math.max(
                    1,
                    Math.ceil(
                        totalProducts /
                        PRODUCTS_PER_PAGE
                    )
                );


            // ==================================================
            // KEEP PAGE VALID
            // ==================================================

            if (
                currentPage >
                totalPages
            ) {

                currentPage =
                    totalPages;
            }


            // ==================================================
            // SKIP
            // ==================================================

            const skip =
                (
                    currentPage - 1
                ) *
                PRODUCTS_PER_PAGE;


            // ==================================================
            // PRODUCTS
            // ==================================================

            const products =
                await Product.find(
                    filter
                )
                .sort(sortOption)
                .skip(skip)
                .limit(PRODUCTS_PER_PAGE)
                .lean();


            // ==================================================
            // SHOWING RANGE
            // ==================================================

            const showingFrom =
                totalProducts === 0
                    ? 0
                    : skip + 1;


            const showingTo =
                Math.min(
                    skip +
                    products.length,
                    totalProducts
                );


            // ==================================================
            // RENDER
            // ==================================================

            return res.render(
                "public/collections",
                {

                    title:
                        `Collections | ${res.locals.siteName}`,

                    description:
                        "Explore handcrafted Patola sarees, Double Ikat, Single Ikat, dupattas and traditional Indian textiles.",

                    pageCss:
                        "/css/pages/collections.css",

                    pageJs:
                        "/js/pages/collections.js",

                    products,

                    search,

                    category,

                    sort,

                    currentPage,

                    totalPages,

                    totalProducts,

                    showingFrom,

                    showingTo

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


// ==========================================================
// PRODUCTS
// ==========================================================

router.get(
    "/products",
    async (req, res) => {

        try {

            // ==================================================
            // PAGINATION
            // ==================================================

            const PRODUCTS_PER_PAGE = 12;


            let currentPage =
                parseInt(
                    req.query.page,
                    10
                );


            if (
                !Number.isInteger(
                    currentPage
                ) ||
                currentPage < 1
            ) {

                currentPage = 1;
            }


            // ==================================================
            // QUERY VALUES
            // ==================================================

            const search =
                String(
                    req.query.search || ""
                ).trim();


            const category =
                String(
                    req.query.category || ""
                ).trim();


            const availability =
                String(
                    req.query.availability || ""
                ).trim();


            // ==================================================
            // MONGODB FILTER
            // ==================================================

            const filter = {};


            // ==================================================
            // SEARCH FILTER
            // ==================================================

            if (search) {

                const searchRegex = {

                    $regex: search,

                    $options: "i"

                };


                filter.$or = [

                    {
                        name: searchRegex
                    },

                    {
                        category: searchRegex
                    },

                    {
                        description: searchRegex
                    },

                    {
                        fabric: searchRegex
                    },

                    {
                        technique: searchRegex
                    },

                    {
                        color: searchRegex
                    }

                ];
            }


            // ==================================================
            // CATEGORY FILTER
            // ==================================================

            const categoryFilters = {

                "Patola Sarees":
                    /^Patola Sarees$/i,

                "Double Ikat Sarees":
                    /^Double Ikat Sarees$/i,

                "Single Ikat Sarees":
                    /^Single Ikat Sarees$/i,

                "Dupattas":
                    /^Dupattas$/i,

                "Accessories":
                    /^Accessories$/i

            };


            if (
                category &&
                categoryFilters[category]
            ) {

                filter.category =
                    categoryFilters[category];
            }


            // ==================================================
            // AVAILABILITY FILTER
            // ==================================================

            const allowedAvailability = [

                "In Stock",

                "Limited",

                "Out of Stock"

            ];


            if (
                allowedAvailability.includes(
                    availability
                )
            ) {

                filter.availability =
                    availability;
            }


            // ==================================================
            // TOTAL PRODUCTS
            // ==================================================

            const totalProducts =
                await Product.countDocuments(
                    filter
                );


            // ==================================================
            // TOTAL PAGES
            // ==================================================

            const totalPages =
                Math.max(
                    1,
                    Math.ceil(
                        totalProducts /
                        PRODUCTS_PER_PAGE
                    )
                );


            // ==================================================
            // KEEP PAGE VALID
            // ==================================================

            if (
                currentPage >
                totalPages
            ) {

                currentPage =
                    totalPages;
            }


            // ==================================================
            // SKIP
            // ==================================================

            const skip =
                (
                    currentPage - 1
                ) *
                PRODUCTS_PER_PAGE;


            // ==================================================
            // GET PRODUCTS
            // ==================================================

            const products =
                await Product.find(
                    filter
                )
                .sort({
                    featured: -1,
                    createdAt: -1
                })
                .skip(skip)
                .limit(PRODUCTS_PER_PAGE)
                .lean();


            // ==================================================
            // SHOWING RANGE
            // ==================================================

            const showingFrom =
                totalProducts === 0
                    ? 0
                    : skip + 1;


            const showingTo =
                Math.min(
                    skip +
                    products.length,
                    totalProducts
                );


            // ==================================================
            // RENDER PRODUCTS PAGE
            // ==================================================

            return res.render(
                "public/products",
                {

                    title:
                        `Products | ${res.locals.siteName}`,

                    description:
                        "Explore handcrafted Patola sarees and traditional Indian textiles.",

                    pageCss:
                        "/css/pages/products.css",

                    products,

                    search,

                    category,

                    availability,

                    page:
                        currentPage,

                    pages:
                        totalPages,

                    totalProducts,

                    showingFrom,

                    showingTo

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


// ==========================================================
// PRODUCT DETAIL
// ==========================================================

router.get(
    "/products/:id",
    async (req, res) => {

        try {

            const {
                id
            } = req.params;


            if (
                !mongoose.Types.ObjectId.isValid(
                    id
                )
            ) {

                return res
                    .status(404)
                    .send(
                        "Product not found"
                    );
            }


            const product =
                await Product.findById(
                    id
                );


            if (!product) {

                return res
                    .status(404)
                    .send(
                        "Product not found"
                    );
            }


            const reviews =
                await Review.find({
                    product:
                        product._id
                })
                .sort({
                    createdAt: -1
                });


            // ==================================================
            // RELATED PRODUCTS
            // ==================================================

            let relatedProducts =
                await Product.find({

                    category:
                        product.category,

                    _id: {
                        $ne:
                            product._id
                    }

                })
                .sort({
                    createdAt: -1
                })
                .limit(4)
                .lean();


            // ==================================================
            // FILL REMAINING RELATED PRODUCTS
            // ==================================================

            if (
                relatedProducts.length < 4
            ) {

                const existingRelatedIds =
                    relatedProducts.map(
                        relatedProduct =>
                            relatedProduct._id
                    );


                const excludedIds = [

                    product._id,

                    ...existingRelatedIds

                ];


                const remainingProducts =
                    await Product.find({

                        _id: {
                            $nin:
                                excludedIds
                        }

                    })
                    .sort({
                        featured: -1,
                        createdAt: -1
                    })
                    .limit(
                        4 -
                        relatedProducts.length
                    )
                    .lean();


                relatedProducts = [

                    ...relatedProducts,

                    ...remainingProducts

                ];
            }


            // ==================================================
            // AVERAGE RATING
            // ==================================================

            const averageRating =
                reviews.length
                    ? (
                        reviews.reduce(
                            (
                                sum,
                                r
                            ) =>
                                sum +
                                Number(
                                    r.rating || 0
                                ),
                            0
                        ) /
                        reviews.length
                    ).toFixed(1)
                    : 0;


            // ==================================================
            // WISHLIST
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
                        await Wishlist.findOne({

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


// ==========================================================
// SEARCH
// ==========================================================

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

                    $regex: query,

                    $options: "i"

                };


                products =
                    await Product.find({

                        $or: [

                            {
                                name: regex
                            },

                            {
                                category: regex
                            },

                            {
                                description: regex
                            },

                            {
                                fabric: regex
                            },

                            {
                                technique: regex
                            },

                            {
                                color: regex
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


// ==========================================================
// ABOUT
// ==========================================================

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


// ==========================================================
// FAQ
// ==========================================================

router.get(
    "/faq",
    (req, res) => {

        return res.render(
            "public/faq",
            {

                title:
                    `Frequently Asked Questions | ${res.locals.siteName}`,

                description:
                    "Find answers about Patola sarees, care, delivery, customization, weaving techniques and contacting Yogita Patola Art.",

                pageCss:
                    "/css/pages/faq.css"

            }
        );

    }
);


// ==========================================================
// CONTACT
// ==========================================================

router.get(
    "/contact",
    (req, res) => {

        if (!res.locals.showContact) {

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
                    req.query.success ||
                    "",

                error:
                    req.query.error ||
                    ""

            }
        );

    }
);


router.post(
    "/contact",
    async (req, res) => {

        try {

            if (!res.locals.showContact) {

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


// ==========================================================
// FEEDBACK
// ==========================================================

router.get(
    "/feedback",
    (req, res) => {

        if (!res.locals.showFeedback) {

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


router.post(
    "/feedback",
    async (req, res) => {

        try {

            if (!res.locals.showFeedback) {

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
                    Number.isInteger(
                        value
                    ) &&
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


// ==========================================================
// FEEDBACK MESSAGE FLAGS
// ==========================================================

router.use(
    (req, res, next) => {

        res.locals.feedbackSuccess =
            req.query.feedbackSuccess === "1";


        res.locals.feedbackError =
            req.query.feedbackError === "1";


        next();

    }
);


// ==========================================================
// PUBLIC 404
// ==========================================================

router.use(
    (req, res) => {

        console.log(
            "PUBLIC 404:",
            req.method,
            req.originalUrl
        );


        return res
            .status(404)
            .render(
                "public/404",
                {

                    title:
                        `Page Not Found | ${res.locals.siteName}`

                }
            );
    }
);


module.exports = router;