const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");
const engine = require("ejs-mate");
const dotenv = require("dotenv");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");

const visitorTracker = require("./middleware/visitorTracker");

dotenv.config();

const app = express();
const isProduction = process.env.NODE_ENV === "production";

const VIEWS_PATH = path.join(__dirname, "views");
const PUBLIC_PATH = path.join(__dirname, "public");
const UPLOADS_PATH = path.join(__dirname, "uploads");

app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("views", VIEWS_PATH);
app.disable("x-powered-by");

app.use(helmet());

app.use(
    express.urlencoded({
        extended: true,
        limit: "100kb"
    })
);

app.use(
    express.json({
        limit: "100kb"
    })
);

app.use(mongoSanitize());
app.use(hpp());

app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 300,
        standardHeaders: "draft-8",
        legacyHeaders: false,
        message: "Too many requests. Please try again later."
    })
);

app.use(express.static(PUBLIC_PATH));
app.use("/uploads", express.static(UPLOADS_PATH));

app.use(
    session({
        name: "ypa.sid",
        secret:
            process.env.SESSION_SECRET ||
            "yogita-patola-secret",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: "lax",
            secure: isProduction,
            maxAge: 7 * 24 * 60 * 60 * 1000
        }
    })
);

app.use((req, res, next) => {
    res.locals.currentUser = req.session?.userId
        ? {
            _id: req.session.userId,
            name: req.session.userName || "Account"
        }
        : null;

    res.locals.currentPath = req.path || "/";

    next();
});

/*
 * VISITOR TRACKING
 *
 * Tracks public GET page visits.
 * Admin, uploads, CSS, JS, images and other
 * static files are ignored by visitorTracker.
 */
app.use(visitorTracker);

/*
 * ADMIN
 */
app.use(
    "/admin",
    require("./routes/adminRoutes")
);

/*
 * USER
 */
app.use(
    "/user",
    require("./routes/userRoutes")
);

app.use(
    "/user",
    require("./routes/passwordRoutes")
);

/*
 * WISHLIST
 */
app.use(
    "/wishlist",
    require("./routes/wishlistRoutes")
);

/*
 * PRODUCTS / REVIEWS
 */
app.use(
    "/products",
    require("./routes/reviewRoutes")
);

app.use(
    "/products",
    require("./routes/productRoutes")
);

/*
 * PUBLIC WEBSITE
 */
app.use(
    "/",
    require("./routes/publicRoutes")
);

/*
 * GLOBAL ERROR HANDLER
 */
app.use((err, req, res, next) => {
    console.error(
        "SERVER ERROR:",
        err
    );

    if (res.headersSent)
        return next(err);

    res.status(500).send(
        isProduction
            ? "Server Error"
            : `Server Error: ${err.message}`
    );
});

const PORT =
    process.env.PORT ||
    5000;

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
                    `Server running at http://localhost:${PORT}`
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