
const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();


// ==================================================
// MODELS
// ==================================================

const Review = require("../models/Review");
const Product = require("../models/Product");
const User = require("../models/User");


// ==================================================
// SUBMIT REVIEW
// POST /products/:productId/review
// ==================================================

router.post(
    "/:productId/review",
    async (req, res) => {

        try {

            console.log("================================");
            console.log("SUBMIT REVIEW");

            console.log(
                "Product ID:",
                req.params.productId
            );


            // ------------------------------------------
            // LOGIN CHECK
            // ------------------------------------------

            if (
                !req.session ||
                !req.session.userId
            ) {

                return res.redirect(
                    `/user/login?redirect=${encodeURIComponent(
                        `/products/${req.params.productId}#reviews`
                    )}`
                );

            }


            // ------------------------------------------
            // VALIDATE PRODUCT ID
            // ------------------------------------------

            if (
                !mongoose.Types.ObjectId.isValid(
                    req.params.productId
                )
            ) {

                return res.status(400).send(
                    "Invalid product ID."
                );

            }


            // ------------------------------------------
            // VALIDATE USER ID
            // ------------------------------------------

            if (
                !mongoose.Types.ObjectId.isValid(
                    req.session.userId
                )
            ) {

                return res.status(400).send(
                    "Invalid user session."
                );

            }


            // ------------------------------------------
            // GET USER
            // ------------------------------------------

            const user =
                await User.findById(
                    req.session.userId
                );


            if (!user) {

                req.session.destroy(() => {

                    return res.redirect(
                        `/user/login?redirect=${encodeURIComponent(
                            `/products/${req.params.productId}#reviews`
                        )}`
                    );

                });

                return;

            }


            // ------------------------------------------
            // GET PRODUCT
            // ------------------------------------------

            const product =
                await Product.findById(
                    req.params.productId
                );


            if (!product) {

                return res.status(404).send(
                    "Product not found."
                );

            }


            // ------------------------------------------
            // FORM DATA
            // ------------------------------------------

            const name =
                String(
                    req.body.name || ""
                ).trim();


            const rating =
                Number(
                    req.body.rating
                );


            const comment =
                String(
                    req.body.message ||
                    req.body.comment ||
                    ""
                ).trim();


            // ------------------------------------------
            // NAME VALIDATION
            // ------------------------------------------

            if (
                !name ||
                name.length < 2 ||
                name.length > 50
            ) {

                return res.status(400).send(
                    "Please enter a valid name."
                );

            }


            // ------------------------------------------
            // RATING VALIDATION
            // ------------------------------------------

            if (
                !Number.isInteger(rating) ||
                rating < 1 ||
                rating > 5
            ) {

                return res.status(400).send(
                    "Please select a rating between 1 and 5."
                );

            }


            // ------------------------------------------
            // COMMENT VALIDATION
            // ------------------------------------------

            if (
                !comment ||
                comment.length < 3 ||
                comment.length > 500
            ) {

                return res.status(400).send(
                    "Please enter a valid review."
                );

            }


            // ------------------------------------------
            // USER EMAIL
            // ------------------------------------------

            const email =
                String(
                    user.email || ""
                ).trim();


            if (!email) {

                return res.status(400).send(
                    "Your account email is required to submit a review."
                );

            }


            // ------------------------------------------
            // CREATE REVIEW
            // ------------------------------------------

            const review =
                new Review({

                    // Product being reviewed
                    product:
                        product._id,

                    // Logged-in user
                    user:
                        user._id,

                    // Reviewer name
                    name:
                        name,

                    // Reviewer email
                    email:
                        email,

                    // Rating
                    rating:
                        rating,

                    // Review text
                    comment:
                        comment,

                    // Admin moderation
                    approved:
                        false

                });


            // ------------------------------------------
            // SAVE REVIEW
            // ------------------------------------------

            await review.save();


            // ------------------------------------------
            // SUCCESS LOG
            // ------------------------------------------

            console.log(
                "Review saved successfully."
            );

            console.log(
                "Review ID:",
                review._id
            );

            console.log(
                "User:",
                user.email
            );

            console.log(
                "Product:",
                product.name
            );

            console.log(
                "Rating:",
                rating
            );

            console.log("================================");


            // ------------------------------------------
            // REDIRECT
            // ------------------------------------------

            return res.redirect(
                `/products/${product._id}#reviews`
            );


        } catch (error) {

            console.error(
                "Review submit error:",
                error
            );

            console.error("================================");


            // ------------------------------------------
            // MONGOOSE VALIDATION ERROR
            // ------------------------------------------

            if (
                error.name ===
                "ValidationError"
            ) {

                const validationMessages =
                    Object.values(
                        error.errors
                    )
                    .map(
                        item =>
                            item.message
                    )
                    .join(" ");


                return res.status(400).send(
                    validationMessages ||
                    "Please check your review details."
                );

            }


            // ------------------------------------------
            // GENERAL ERROR
            // ------------------------------------------

            return res.status(500).send(
                "Unable to submit review."
            );

        }

    }
);


// ==================================================
// DELETE REVIEW
// Optional API support
// DELETE /reviews/:reviewId
// ==================================================

router.delete(
    "/:reviewId",
    async (req, res) => {

        try {

            if (
                !mongoose.Types.ObjectId.isValid(
                    req.params.reviewId
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid review ID."

                });

            }


            const review =
                await Review.findByIdAndDelete(
                    req.params.reviewId
                );


            if (!review) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Review not found."

                });

            }


            return res.json({

                success: true,

                message:
                    "Review deleted successfully."

            });


        } catch (error) {

            console.error(
                "Delete review error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to delete review."

            });

        }

    }
);


// ==================================================
// EXPORT
// ==================================================

module.exports = router;

