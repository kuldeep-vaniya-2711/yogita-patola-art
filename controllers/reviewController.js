const mongoose = require("mongoose");

const Review = require("../models/Review");


// ==================================================
// GET ALL REVIEWS
// GET /admin/reviews
// ==================================================

exports.getAdminReviews = async (req, res) => {

    try {

        const reviews =
            await Review.find({})
                .populate("product")
                .populate("user")
                .sort({
                    createdAt: -1
                });


        return res.render(
            "admin/reviews",
            {
                title: "Reviews Management",

                pageCss:
                    "/css/admin/reviews.css",

                pageJs:
                    "/js/admin/reviews.js",

                reviews,

                success:
                    req.query.success || "",

                error:
                    req.query.error || ""
            }
        );


    } catch (error) {

        console.error(
            "Admin reviews fetch error:",
            error
        );


        return res.status(500).send(
            "Unable to load reviews."
        );

    }

};


// ==================================================
// APPROVE REVIEW
// POST /admin/reviews/:id/approve
// ==================================================

exports.approveReview = async (req, res) => {

    try {

        const { id } = req.params;


        if (
            !mongoose.Types.ObjectId.isValid(id)
        ) {

            return res.redirect(
                "/admin/reviews?error=Invalid+review+ID"
            );

        }


        const review =
            await Review.findById(id);


        if (!review) {

            return res.redirect(
                "/admin/reviews?error=Review+not+found"
            );

        }


        review.approved = true;

        await review.save();


        console.log(
            "Review approved:",
            review._id
        );


        return res.redirect(
            "/admin/reviews?success=Review+approved+successfully"
        );


    } catch (error) {

        console.error(
            "Review approve error:",
            error
        );


        return res.redirect(
            "/admin/reviews?error=Unable+to+approve+review"
        );

    }

};


// ==================================================
// REJECT REVIEW
// POST /admin/reviews/:id/reject
// ==================================================

exports.rejectReview = async (req, res) => {

    try {

        const { id } = req.params;


        if (
            !mongoose.Types.ObjectId.isValid(id)
        ) {

            return res.redirect(
                "/admin/reviews?error=Invalid+review+ID"
            );

        }


        const review =
            await Review.findById(id);


        if (!review) {

            return res.redirect(
                "/admin/reviews?error=Review+not+found"
            );

        }


        review.approved = false;

        await review.save();


        console.log(
            "Review rejected:",
            review._id
        );


        return res.redirect(
            "/admin/reviews?success=Review+rejected+successfully"
        );


    } catch (error) {

        console.error(
            "Review reject error:",
            error
        );


        return res.redirect(
            "/admin/reviews?error=Unable+to+reject+review"
        );

    }

};


// ==================================================
// DELETE REVIEW
// POST /admin/reviews/:id/delete
// ==================================================

exports.deleteReview = async (req, res) => {

    try {

        const { id } = req.params;


        if (
            !mongoose.Types.ObjectId.isValid(id)
        ) {

            return res.redirect(
                "/admin/reviews?error=Invalid+review+ID"
            );

        }


        const deleted =
            await Review.findByIdAndDelete(id);


        if (!deleted) {

            return res.redirect(
                "/admin/reviews?error=Review+not+found"
            );

        }


        console.log(
            "Review deleted:",
            deleted._id
        );


        return res.redirect(
            "/admin/reviews?success=Review+deleted+successfully"
        );


    } catch (error) {

        console.error(
            "Review delete error:",
            error
        );


        return res.redirect(
            "/admin/reviews?error=Unable+to+delete+review"
        );

    }

};
