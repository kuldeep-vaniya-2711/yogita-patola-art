const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");
const User = require("../models/User");

function getUserId(req) {
    return req.session?.userId || req.session?.user?._id?.toString() || null;
}

function requireLogin(req, res, next) {
    if (!getUserId(req)) {
        return res.redirect("/user/login?redirect=" + encodeURIComponent(req.originalUrl));
    }
    next();
}

const validId = id => mongoose.Types.ObjectId.isValid(id);

// GET /wishlist/test
router.get("/test", (req, res) => res.send("Wishlist routes are working!"));

// GET /wishlist
router.get("/", requireLogin, async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!validId(userId)) return res.status(400).send("Invalid user session.");

        const user = await User.findById(userId).select("-password");
        if (!user) {
            req.session.destroy(() => {});
            return res.redirect("/user/login");
        }

        const wishlist = await Wishlist.find({ user: user._id })
            .populate("product")
            .sort({ createdAt: -1 });

        return res.render("user/wishlist", {
            title: "My Wishlist | Yogita Patola Art",
            description: "Your saved products and favorite handcrafted Patola products.",
            wishlist: wishlist.filter(item => item.product),
            user
        });
    } catch (error) {
        console.error("Wishlist page error:", error);
        return res.status(500).send("Unable to load wishlist.");
    }
});

// GET /wishlist/add/:productId
router.get("/add/:productId", requireLogin, async (req, res) => {
    try {
        const userId = getUserId(req);
        const { productId } = req.params;

        if (!validId(userId)) return res.status(400).send("Invalid user session.");
        if (!validId(productId)) return res.status(400).send("Invalid product ID.");

        const user = await User.findById(userId);
        if (!user) {
            req.session.destroy(() => {});
            return res.redirect("/user/login");
        }

        const product = await Product.findById(productId);
        if (!product) return res.status(404).send("Product not found.");

        const existing = await Wishlist.findOne({ user: user._id, product: product._id });
        if (existing) {
            return res.redirect(`/products/${product._id}`);
        }

        await Wishlist.create({ user: user._id, product: product._id });
        return res.redirect(`/products/${product._id}`);
    } catch (error) {
        console.error("Add wishlist GET error:", error);
        if (error?.code === 11000) return res.redirect(`/products/${req.params.productId}`);
        return res.status(500).send("Unable to add product to wishlist.");
    }
});

// POST /wishlist/add/:productId
router.post("/add/:productId", requireLogin, async (req, res) => {
    const isHtml = req.headers.accept && req.headers.accept.includes("text/html");
    try {
        const userId = getUserId(req);
        const { productId } = req.params;

        if (!validId(userId)) {
            return res.status(400).json({ success: false, message: "Invalid user session." });
        }
        if (!validId(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID." });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return isHtml
                ? res.status(404).send("Product not found.")
                : res.status(404).json({ success: false, message: "Product not found." });
        }

        const existing = await Wishlist.findOne({ user: userId, product: product._id });
        if (existing) {
            return isHtml
                ? res.redirect(`/products/${product._id}`)
                : res.json({ success: true, alreadyExists: true, message: "Product is already in your wishlist." });
        }

        const item = await Wishlist.create({ user: userId, product: product._id });
        return isHtml
            ? res.redirect(`/products/${product._id}`)
            : res.json({ success: true, alreadyExists: false, message: "Product added to wishlist.", wishlistId: item._id });
    } catch (error) {
        console.error("Add wishlist POST error:", error);
        if (error?.code === 11000) {
            return isHtml
                ? res.redirect(`/products/${req.params.productId}`)
                : res.json({ success: true, alreadyExists: true, message: "Product is already in your wishlist." });
        }
        return isHtml
            ? res.status(500).send("Unable to add product to wishlist.")
            : res.status(500).json({ success: false, message: "Unable to add product to wishlist." });
    }
});

// Remove handler shared between POST and GET
const handleRemove = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { productId } = req.params;

        if (!validId(userId)) return res.status(400).send("Invalid user session.");
        if (!validId(productId)) return res.status(400).send("Invalid product ID.");

        await Wishlist.findOneAndDelete({ user: userId, product: productId });
        return res.redirect("/wishlist");
    } catch (error) {
        console.error("Remove wishlist error:", error);
        return res.status(500).send("Unable to remove wishlist item.");
    }
};

router.post("/remove/:productId", requireLogin, handleRemove);
router.get("/remove/:productId", requireLogin, handleRemove);

module.exports = router;