const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");
const User = require("../models/User");


// ==================================================
// HELPERS
// ==================================================

function getUserId(req) {
    if (req.session?.userId) {
        return req.session.userId;
    }

    if (req.session?.user?._id) {
        return req.session.user._id.toString();
    }

    return null;
}


function requireLogin(req, res, next) {
    if (!getUserId(req)) {
        return res.redirect(
            "/user/login?redirect=" +
            encodeURIComponent(req.originalUrl)
        );
    }

    next();
}


function validId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}


// ==================================================
// TEST
// GET /wishlist/test
// ==================================================

router.get("/test", (req, res) => {
    res.send("Wishlist routes are working!");
});


// ==================================================
// WISHLIST PAGE
// GET /wishlist
// ==================================================

router.get("/", requireLogin, async (req, res) => {

    try {

        const userId = getUserId(req);

        if (!validId(userId)) {
            return res.status(400).send("Invalid user session.");
        }

        const user = await User
            .findById(userId)
            .select("-password");

        if (!user) {
            req.session.destroy(() => {});
            return res.redirect("/user/login");
        }

        const wishlist = await Wishlist
            .find({ user: user._id })
            .populate("product")
            .sort({ createdAt: -1 });

        const validWishlist = wishlist.filter(
            item => item.product
        );

        return res.render("user/wishlist", {
            title: "My Wishlist | Yogita Patola Art",

            description:
                "Your saved products and favorite handcrafted Patola products.",

            wishlist: validWishlist,

            user
        });

    } catch (error) {

        console.error("Wishlist page error:", error);

        return res.status(500).send(
            "Unable to load wishlist."
        );
    }
});


// ==================================================
// ADD TO WISHLIST
// GET /wishlist/add/:productId
// ==================================================

router.get(
    "/add/:productId",
    requireLogin,
    async (req, res) => {

        try {

            const userId = getUserId(req);
            const productId = req.params.productId;

            if (!validId(userId)) {
                return res.status(400).send(
                    "Invalid user session."
                );
            }

            if (!validId(productId)) {
                return res.status(400).send(
                    "Invalid product ID."
                );
            }

            const user = await User.findById(userId);

            if (!user) {
                req.session.destroy(() => {});
                return res.redirect("/user/login");
            }

            const product = await Product.findById(productId);

            if (!product) {
                return res.status(404).send(
                    "Product not found."
                );
            }

            const existing = await Wishlist.findOne({
                user: user._id,
                product: product._id
            });

            // Already added → simply return to product page
            if (existing) {
                return res.redirect(
                    `/products/${product._id}`
                );
            }

            await Wishlist.create({
                user: user._id,
                product: product._id
            });

            return res.redirect(
                `/products/${product._id}`
            );

        } catch (error) {

            console.error(
                "Add wishlist GET error:",
                error
            );

            if (error?.code === 11000) {
                return res.redirect(
                    `/products/${req.params.productId}`
                );
            }

            return res.status(500).send(
                "Unable to add product to wishlist."
            );
        }
    }
);


// ==================================================
// ADD TO WISHLIST
// POST /wishlist/add/:productId
// ==================================================

router.post(
    "/add/:productId",
    requireLogin,
    async (req, res) => {

        try {

            const userId = getUserId(req);
            const productId = req.params.productId;

            if (!validId(userId)) {

                return res.status(400).json({
                    success: false,
                    message: "Invalid user session."
                });
            }

            if (!validId(productId)) {

                return res.status(400).json({
                    success: false,
                    message: "Invalid product ID."
                });
            }

            const product =
                await Product.findById(productId);

            if (!product) {

                if (
                    req.headers.accept &&
                    req.headers.accept.includes("text/html")
                ) {
                    return res.status(404).send(
                        "Product not found."
                    );
                }

                return res.status(404).json({
                    success: false,
                    message: "Product not found."
                });
            }

            const existing =
                await Wishlist.findOne({
                    user: userId,
                    product: product._id
                });

            // ==================================================
            // ALREADY IN WISHLIST
            // ==================================================

            if (existing) {

                /*
                 * Normal HTML form submission:
                 * go back to product page instead of showing JSON.
                 */

                if (
                    req.headers.accept &&
                    req.headers.accept.includes("text/html")
                ) {
                    return res.redirect(
                        `/products/${product._id}`
                    );
                }

                /*
                 * Keep JSON support for fetch/AJAX requests.
                 */

                return res.json({
                    success: true,
                    alreadyExists: true,
                    message:
                        "Product is already in your wishlist."
                });
            }


            // ==================================================
            // CREATE WISHLIST ITEM
            // ==================================================

            const item =
                await Wishlist.create({
                    user: userId,
                    product: product._id
                });


            /*
             * Normal browser form submission.
             */

            if (
                req.headers.accept &&
                req.headers.accept.includes("text/html")
            ) {
                return res.redirect(
                    `/products/${product._id}`
                );
            }


            /*
             * AJAX / fetch support.
             */

            return res.json({
                success: true,
                alreadyExists: false,
                message:
                    "Product added to wishlist.",
                wishlistId: item._id
            });

        } catch (error) {

            console.error(
                "Add wishlist POST error:",
                error
            );


            // Duplicate key protection
            if (error?.code === 11000) {

                if (
                    req.headers.accept &&
                    req.headers.accept.includes("text/html")
                ) {
                    return res.redirect(
                        `/products/${req.params.productId}`
                    );
                }

                return res.json({
                    success: true,
                    alreadyExists: true,
                    message:
                        "Product is already in your wishlist."
                });
            }


            if (
                req.headers.accept &&
                req.headers.accept.includes("text/html")
            ) {
                return res.status(500).send(
                    "Unable to add product to wishlist."
                );
            }


            return res.status(500).json({
                success: false,
                message:
                    "Unable to add product to wishlist."
            });
        }
    }
);


// ==================================================
// REMOVE FROM WISHLIST
// POST /wishlist/remove/:productId
// ==================================================

router.post(
    "/remove/:productId",
    requireLogin,
    async (req, res) => {

        try {

            const userId = getUserId(req);
            const productId = req.params.productId;

            if (!validId(userId)) {
                return res.status(400).send(
                    "Invalid user session."
                );
            }

            if (!validId(productId)) {
                return res.status(400).send(
                    "Invalid product ID."
                );
            }

            await Wishlist.findOneAndDelete({
                user: userId,
                product: productId
            });

            return res.redirect("/wishlist");

        } catch (error) {

            console.error(
                "Remove wishlist POST error:",
                error
            );

            return res.status(500).send(
                "Unable to remove product from wishlist."
            );
        }
    }
);


// ==================================================
// REMOVE FROM WISHLIST
// GET /wishlist/remove/:productId
// ==================================================

router.get(
    "/remove/:productId",
    requireLogin,
    async (req, res) => {

        try {

            const userId = getUserId(req);
            const productId = req.params.productId;

            if (!validId(userId)) {
                return res.status(400).send(
                    "Invalid user session."
                );
            }

            if (!validId(productId)) {
                return res.status(400).send(
                    "Invalid product ID."
                );
            }

            await Wishlist.findOneAndDelete({
                user: userId,
                product: productId
            });

            return res.redirect("/wishlist");

        } catch (error) {

            console.error(
                "Remove wishlist GET error:",
                error
            );

            return res.status(500).send(
                "Unable to remove wishlist item."
            );
        }
    }
);


// ==================================================
// EXPORT
// ==================================================

module.exports = router;