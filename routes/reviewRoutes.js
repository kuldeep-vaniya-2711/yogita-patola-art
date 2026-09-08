const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Review = require("../models/Review");
const Product = require("../models/Product");
const User = require("../models/User");

// Submit Review: POST /products/:productId/review
router.post("/:productId/review", async (req, res) => {
    try {
        const { productId } = req.params;
        const redirectUrl = `/user/login?redirect=${encodeURIComponent(`/products/${productId}#reviews`)}`;

        if (!req.session?.userId) {
            return res.redirect(redirectUrl);
        }

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).send("Invalid product ID.");
        }
        if (!mongoose.Types.ObjectId.isValid(req.session.userId)) {
            return res.status(400).send("Invalid user session.");
        }

        const user = await User.findById(req.session.userId);
        if (!user) {
            return req.session.destroy(() => res.redirect(redirectUrl));
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send("Product not found.");
        }

        const name = String(req.body.name || "").trim();
        const rating = Number(req.body.rating);
        const comment = String(req.body.message || req.body.comment || "").trim();

        if (!name || name.length < 2 || name.length > 50) {
            return res.status(400).send("Please enter a valid name.");
        }
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).send("Please select a rating between 1 and 5.");
        }
        if (!comment || comment.length < 3 || comment.length > 500) {
            return res.status(400).send("Please enter a valid review.");
        }

        const email = String(user.email || "").trim();
        if (!email) {
            return res.status(400).send("Your account email is required to submit a review.");
        }

        const review = new Review({
            product: product._id,
            user: user._id,
            name,
            email,
            rating,
            comment,
            approved: false
        });

        await review.save();
        console.log("Review saved successfully.\nReview ID:", review._id, "\nUser:", user.email, "\nProduct:", product.name);

        return res.redirect(`/products/${product._id}#reviews`);
    } catch (error) {
        console.error("Review submit error:", error);
        if (error.name === "ValidationError") {
            const validationMessages = Object.values(error.errors).map(item => item.message).join(" ");
            return res.status(400).send(validationMessages || "Please check your review details.");
        }
        return res.status(500).send("Unable to submit review.");
    }
});

// Delete Review: DELETE /products/:reviewId
router.delete("/:reviewId", async (req, res) => {
    try {
        const { reviewId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).json({ success: false, message: "Invalid review ID." });
        }

        const review = await Review.findByIdAndDelete(reviewId);
        if (!review) {
            return res.status(404).json({ success: false, message: "Review not found." });
        }

        return res.json({ success: true, message: "Review deleted successfully." });
    } catch (error) {
        console.error("Delete review error:", error);
        return res.status(500).json({ success: false, message: "Unable to delete review." });
    }
});

module.exports = router;
