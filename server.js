const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");
const engine = require("ejs-mate");
const dotenv = require("dotenv");

dotenv.config();

const app = express();


// ==================================================
// PATHS
// ==================================================

const VIEWS_PATH =
    path.join(__dirname, "views");

const PUBLIC_PATH =
    path.join(__dirname, "public");

const UPLOADS_PATH =
    path.join(__dirname, "uploads");


// ==================================================
// EJS
// ==================================================

app.engine("ejs", engine);

app.set(
    "view engine",
    "ejs"
);

app.set(
    "views",
    VIEWS_PATH
);


// ==================================================
// MIDDLEWARE
// ==================================================

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(
    express.json()
);


// ==================================================
// STATIC FILES
// ==================================================

app.use(
    express.static(PUBLIC_PATH)
);

app.use(
    "/uploads",
    express.static(UPLOADS_PATH)
);


// ==================================================
// SESSION
// ==================================================

app.use(
    session({

        secret:
            process.env.SESSION_SECRET ||
            "yogita-patola-secret",

        resave: false,

        saveUninitialized: false

    })
);


// ==================================================
// GLOBAL LOCALS
// ==================================================

app.use(
    (req, res, next) => {

        res.locals.currentUser =
            req.session?.userId
                ? {

                    _id:
                        req.session.userId,

                    name:
                        req.session.userName ||
                        "Account"

                }
                : null;


        res.locals.currentPath =
            req.path || "/";


        next();

    }
);


// ==================================================
// ADMIN ROUTES
// ==================================================

app.use(
    "/admin",
    require("./routes/adminRoutes")
);


// ==================================================
// USER ROUTES
// ==================================================

app.use(
    "/user",
    require("./routes/userRoutes")
);


// ==================================================
// PASSWORD ROUTES
//
// Forgot Password
// Verify Reset OTP
// Reset Password
// Change Password
//
// passwordRoutes.js contains:
//
// /forgot-password
// /verify-reset-otp
// /resend-reset-otp
// /reset-password
// /change-password
//
// Because it is mounted at /user,
// final URLs become:
//
// /user/forgot-password
// /user/verify-reset-otp
// /user/resend-reset-otp
// /user/reset-password
// /user/change-password
// ==================================================

app.use(
    "/user",
    require("./routes/passwordRoutes")
);


// ==================================================
// WISHLIST ROUTES
// ==================================================

app.use(
    "/wishlist",
    require("./routes/wishlistRoutes")
);


// ==================================================
// REVIEW ROUTES
// IMPORTANT
//
// reviewRoutes.js contains:
//
// router.post(
//     "/:productId/review",
//     ...
// )
//
// Therefore it MUST be mounted at /products.
//
// Final URL:
//
// POST /products/:productId/review
// ==================================================

app.use(
    "/products",
    require("./routes/reviewRoutes")
);


// ==================================================
// PRODUCT ROUTES
// ==================================================

app.use(
    "/products",
    require("./routes/productRoutes")
);


// ==================================================
// PUBLIC ROUTES
//
// MUST ALWAYS BE LAST
//
// publicRoutes contains the public 404
// catch-all route.
// ==================================================

app.use(
    "/",
    require("./routes/publicRoutes")
);


// ==================================================
// GLOBAL ERROR HANDLER
// ==================================================

app.use(
    (err, req, res, next) => {

        console.error(
            "================================"
        );

        console.error(
            "SERVER ERROR:",
            err
        );

        console.error(
            "================================"
        );


        if (res.headersSent) {

            return next(err);

        }


        res
            .status(500)
            .send(
                "Server Error: " +
                err.message
            );

    }
);


// ==================================================
// DATABASE + SERVER
// ==================================================

const PORT =
    process.env.PORT || 5000;


async function startServer() {

    try {

        console.log(
            "Connecting to MongoDB..."
        );


        await mongoose.connect(
            process.env.MONGODB_URI
        );


        console.log(
            "MongoDB connected successfully"
        );


        app.listen(
            PORT,
            () => {

                console.log(
                    "================================"
                );

                console.log(
                    `Server running at http://localhost:${PORT}`
                );

                console.log(
                    "================================"
                );

            }
        );


    } catch (error) {

        console.error(
            "MongoDB connection error:",
            error
        );


        process.exit(1);

    }

}


startServer();