
const mongoose = require("mongoose");

const Feedback =
    require("../models/Feedback");


// =========================================================
// ALLOWED STATUS VALUES
// =========================================================

const allowedStatuses = [
    "New",
    "Read",
    "Resolved"
];


// =========================================================
// GET ADMIN FEEDBACK
// GET /admin/feedback
// =========================================================

exports.getAdminFeedback =
    async function (req, res) {

        try {

            const feedbacks =
                await Feedback.find({})
                    .sort({
                        createdAt: -1
                    });


            return res.render(
                "admin/feedback",
                {

                    title:
                        "Feedback Management",

                    pageCss:
                        "/css/admin/feedback.css",

                    pageJs:
                        "/js/admin/feedback.js",

                    feedbacks,

                    success:
                        req.query.success ||
                        "",

                    error:
                        req.query.error ||
                        ""

                }
            );

        } catch (error) {

            console.error(
                "Admin feedback fetch error:",
                error
            );


            return res.status(500).send(
                "Server Error"
            );

        }

    };


// =========================================================
// UPDATE FEEDBACK STATUS
// POST /admin/feedback/status/:id
// =========================================================

exports.updateFeedbackStatus =
    async function (req, res) {

        try {

            const id =
                req.params.id;


            const status =
                String(
                    req.body.status || ""
                ).trim();


            // -------------------------------------------------
            // VALIDATE ID
            // -------------------------------------------------

            if (
                !mongoose.Types.ObjectId.isValid(
                    id
                )
            ) {

                return res.redirect(
                    "/admin/feedback?error=Invalid+feedback+ID"
                );

            }


            // -------------------------------------------------
            // VALIDATE STATUS
            // -------------------------------------------------

            if (
                !allowedStatuses.includes(
                    status
                )
            ) {

                return res.redirect(
                    "/admin/feedback?error=Invalid+feedback+status"
                );

            }


            // -------------------------------------------------
            // FIND FEEDBACK
            // -------------------------------------------------

            const feedback =
                await Feedback.findById(id);


            if (!feedback) {

                return res.redirect(
                    "/admin/feedback?error=Feedback+not+found"
                );

            }


            // -------------------------------------------------
            // UPDATE STATUS
            // -------------------------------------------------

            feedback.status =
                status;


            await feedback.save();


            // -------------------------------------------------
            // SUCCESS
            // -------------------------------------------------

            return res.redirect(
                "/admin/feedback?success=Feedback+status+updated+successfully"
            );

        } catch (error) {

            console.error(
                "Admin feedback status update error:",
                error
            );


            return res.redirect(
                "/admin/feedback?error=Unable+to+update+feedback+status"
            );

        }

    };


// =========================================================
// DELETE FEEDBACK
// POST /admin/feedback/delete/:id
// =========================================================

exports.deleteFeedback =
    async function (req, res) {

        try {

            const id =
                req.params.id;


            // -------------------------------------------------
            // VALIDATE ID
            // -------------------------------------------------

            if (
                !mongoose.Types.ObjectId.isValid(
                    id
                )
            ) {

                return res.redirect(
                    "/admin/feedback?error=Invalid+feedback+ID"
                );

            }


            // -------------------------------------------------
            // DELETE
            // -------------------------------------------------

            const deleted =
                await Feedback.findByIdAndDelete(
                    id
                );


            if (!deleted) {

                return res.redirect(
                    "/admin/feedback?error=Feedback+not+found"
                );

            }


            // -------------------------------------------------
            // SUCCESS
            // -------------------------------------------------

            return res.redirect(
                "/admin/feedback?success=Feedback+deleted+successfully"
            );

        } catch (error) {

            console.error(
                "Admin feedback delete error:",
                error
            );


            return res.redirect(
                "/admin/feedback?error=Unable+to+delete+feedback"
            );

        }

    };

