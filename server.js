const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");
const engine = require("ejs-mate");
const dotenv = require("dotenv");

const visitorTracker = require("./middleware/visitorTracker");

dotenv.config();

const app = express();

// View Engine & Static Paths
app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Session Configuration
app.use(session({
    secret: process.env.SESSION_SECRET || "yogita-patola-secret",
    resave: false,
    saveUninitialized: false
}));

// Global Template Locals
app.use((req, res, next) => {
    res.locals.currentUser = req.session?.userId
        ? { _id: req.session.userId, name: req.session.userName || "Account" }
        : null;
    res.locals.currentPath = req.path || "/";
    next();
});

// Visitor Tracking
app.use(visitorTracker);

// Routes
app.use("/admin", require("./routes/adminRoutes"));
app.use("/user", require("./routes/userRoutes"));
app.use("/user", require("./routes/passwordRoutes"));
app.use("/wishlist", require("./routes/wishlistRoutes"));
app.use("/products", require("./routes/reviewRoutes"));
app.use("/products", require("./routes/productRoutes"));
app.use("/", require("./routes/publicRoutes"));

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("================================");
    console.error("SERVER ERROR:", err);
    console.error("================================");
    if (res.headersSent) return next(err);
    res.status(500).send("Server Error: " + err.message);
});

// Database & Server Startup
const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected successfully");

        app.listen(PORT, () => {
            console.log("================================");
            console.log(`Server running at http://localhost:${PORT}`);
            console.log("================================");
        });
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
}

startServer();