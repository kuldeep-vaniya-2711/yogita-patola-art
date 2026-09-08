const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Review = require("../models/Review");

// GET Product Details
router.get("/product/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).send("Product ID is required.");

        const product = await Product.findById(id);
        if (!product) return res.status(404).send("Product not found.");

        const reviews = await Review.find({ product: id }).sort({ createdAt: -1 });
        const averageRating = reviews.length
            ? (reviews.reduce((total, r) => total + Number(r.rating), 0) / reviews.length).toFixed(1)
            : 0;

        return res.render("public/product-detail", {
            title: `${product.name} | Yogita Patola Art`,
            pageCss: "/css/pages/product-detail.css",
            pageJs: "/js/pages/product-detail.js",
            product,
            reviews,
            averageRating
        });
    } catch (error) {
        console.error("Product detail error:", error);
        if (error.name === "CastError") return res.status(404).send("Product not found.");
        return res.status(500).send("Unable to load product.");
    }
});

// POST Add Review
router.post("/product/:id/review", async (req, res) => {
    try {
        const { id } = req.params;
        const cleanName = typeof req.body.name === "string" ? req.body.name.trim() : "";
        const cleanComment = typeof req.body.comment === "string" ? req.body.comment.trim() : "";
        const cleanRating = Number(req.body.rating);

        if (!cleanName || !cleanComment || !req.body.rating) {
            return res.status(400).send("Please fill all review fields.");
        }
        if (!Number.isInteger(cleanRating) || cleanRating < 1 || cleanRating > 5) {
            return res.status(400).send("Rating must be between 1 and 5.");
        }
        if (cleanName.length < 2 || cleanName.length > 50) {
            return res.status(400).send("Name must be between 2 and 50 characters.");
        }
        if (cleanComment.length < 3 || cleanComment.length > 1000) {
            return res.status(400).send("Review must be between 3 and 1000 characters.");
        }

        const product = await Product.findById(id);
        if (!product) return res.status(404).send("Product not found.");

        const review = new Review({
            product: id,
            name: cleanName,
            rating: cleanRating,
            comment: cleanComment
        });
        await review.save();

        return res.redirect(`/product/${id}#reviews`);
    } catch (error) {
        console.error("Add review error:", error);
        if (error.name === "CastError") return res.status(404).send("Product not found.");
        return res.status(500).send("Unable to submit review.");
    }
});

module.exports = router;
