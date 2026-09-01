
const express = require("express");

const router = express.Router();


// ==================================================
// MODELS
// ==================================================

const Product = require("../models/Product");
const Review = require("../models/Review");


// ==================================================
// GET PRODUCT DETAILS
// ==================================================
//
// IMPORTANT:
// If the same /product/:id route is already active
// inside publicRoutes.js, DO NOT mount this route
// again. Use this logic in publicRoutes.js instead.
// ==================================================

router.get(
    "/product/:id",
    async (req, res) => {

        try {

            // ------------------------------------------
            // PRODUCT ID
            // ------------------------------------------

            const productId =
                req.params.id;


            if (!productId) {

                return res.status(400).send(
                    "Product ID is required."
                );

            }


            // ------------------------------------------
            // FIND PRODUCT
            // ------------------------------------------

            const product =
                await Product.findById(
                    productId
                );


            if (!product) {

                return res.status(404).send(
                    "Product not found."
                );

            }


            // ------------------------------------------
            // FIND REVIEWS
            // ------------------------------------------

            const reviews =
                await Review.find({
                    product: productId
                })
                .sort({
                    createdAt: -1
                });


            // ------------------------------------------
            // CALCULATE AVERAGE RATING
            // ------------------------------------------

            let averageRating = 0;


            if (
                reviews.length > 0
            ) {

                const totalRating =
                    reviews.reduce(
                        (
                            total,
                            review
                        ) => {

                            return (
                                total +
                                Number(
                                    review.rating
                                )
                            );

                        },
                        0
                    );


                averageRating =
                    (
                        totalRating /
                        reviews.length
                    ).toFixed(1);

            }


            // ------------------------------------------
            // RENDER PRODUCT DETAIL
            // ------------------------------------------

            return res.render(
                "public/product-detail",
                {
                    title:
                        product.name +
                        " | Yogita Patola Art",
                    pageCss:
                        "/css/pages/product-detail.css",
                    pageJs:
                        "/js/pages/product-detail.js",
                    product,
                    reviews,
                    averageRating
                }
            );

        } catch (error) {

            console.error(
                "Product detail error:",
                error
            );


            // ------------------------------------------
            // INVALID MONGODB ID
            // ------------------------------------------

            if (
                error.name ===
                "CastError"
            ) {

                return res.status(404).send(
                    "Product not found."
                );

            }


            return res.status(500).send(
                "Unable to load product."
            );

        }

    }
);


// ==================================================
// ADD PRODUCT REVIEW
// ==================================================

router.post(
    "/product/:id/review",
    async (req, res) => {

        try {

            // ------------------------------------------
            // PRODUCT ID
            // ------------------------------------------

            const productId =
                req.params.id;


            // ------------------------------------------
            // FORM DATA
            // ------------------------------------------

            const {
                name,
                rating,
                comment
            } = req.body;


            // ------------------------------------------
            // CLEAN DATA
            // ------------------------------------------

            const cleanName =
                typeof name === "string"
                    ? name.trim()
                    : "";

            const cleanComment =
                typeof comment === "string"
                    ? comment.trim()
                    : "";

            const cleanRating =
                Number(rating);


            // ------------------------------------------
            // REQUIRED FIELDS
            // ------------------------------------------

            if (
                !cleanName ||
                !cleanComment ||
                !rating
            ) {

                return res.status(400).send(
                    "Please fill all review fields."
                );

            }


            // ------------------------------------------
            // RATING VALIDATION
            // ------------------------------------------

            if (
                !Number.isInteger(
                    cleanRating
                ) ||
                cleanRating < 1 ||
                cleanRating > 5
            ) {

                return res.status(400).send(
                    "Rating must be between 1 and 5."
                );

            }


            // ------------------------------------------
            // NAME VALIDATION
            // ------------------------------------------

            if (
                cleanName.length < 2 ||
                cleanName.length > 50
            ) {

                return res.status(400).send(
                    "Name must be between 2 and 50 characters."
                );

            }


            // ------------------------------------------
            // COMMENT VALIDATION
            // ------------------------------------------

            if (
                cleanComment.length < 3 ||
                cleanComment.length > 1000
            ) {

                return res.status(400).send(
                    "Review must be between 3 and 1000 characters."
                );

            }


            // ------------------------------------------
            // CHECK PRODUCT
            // ------------------------------------------

            const product =
                await Product.findById(
                    productId
                );


            if (!product) {

                return res.status(404).send(
                    "Product not found."
                );

            }


            // ------------------------------------------
            // CREATE REVIEW
            // ------------------------------------------

            const review =
                new Review({

                    product:
                        productId,

                    name:
                        cleanName,

                    rating:
                        cleanRating,

                    comment:
                        cleanComment

                });


            await review.save();


            // ------------------------------------------
            // REDIRECT
            // ------------------------------------------

            return res.redirect(
                `/product/${productId}#reviews`
            );

        } catch (error) {

            console.error(
                "Add review error:",
                error
            );


            if (
                error.name ===
                "CastError"
            ) {

                return res.status(404).send(
                    "Product not found."
                );

            }


            return res.status(500).send(
                "Unable to submit review."
            );

        }

    }
);


// ==================================================
// EXPORT
// ==================================================

module.exports = router;

