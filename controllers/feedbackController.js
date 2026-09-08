const mongoose = require("mongoose");
const Feedback = require("../models/Feedback");

const allowedStatuses = ["New", "Read", "Resolved"];

exports.getAdminFeedback = async (req, res) => {
    try {
        const feedbacks = await Feedback.find({}).sort({ createdAt: -1 });
        return res.render("admin/feedback", {
            title: "Feedback Management",
            pageCss: "/css/admin/feedback.css",
            pageJs: "/js/admin/feedback.js",
            feedbacks,
            success: req.query.success || "",
            error: req.query.error || ""
        });
    } catch (error) {
        console.error("Admin feedback fetch error:", error);
        return res.status(500).send("Server Error");
    }
};

exports.updateFeedbackStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const status = String(req.body.status || "").trim();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.redirect("/admin/feedback?error=Invalid+feedback+ID");
        }
        if (!allowedStatuses.includes(status)) {
            return res.redirect("/admin/feedback?error=Invalid+feedback+status");
        }

        const feedback = await Feedback.findById(id);
        if (!feedback) {
            return res.redirect("/admin/feedback?error=Feedback+not+found");
        }

        feedback.status = status;
        await feedback.save();
        return res.redirect("/admin/feedback?success=Feedback+status+updated+successfully");
    } catch (error) {
        console.error("Admin feedback status update error:", error);
        return res.redirect("/admin/feedback?error=Unable+to+update+feedback+status");
    }
};

exports.deleteFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.redirect("/admin/feedback?error=Invalid+feedback+ID");
        }

        const deleted = await Feedback.findByIdAndDelete(id);
        if (!deleted) {
            return res.redirect("/admin/feedback?error=Feedback+not+found");
        }
        return res.redirect("/admin/feedback?success=Feedback+deleted+successfully");
    } catch (error) {
        console.error("Admin feedback delete error:", error);
        return res.redirect("/admin/feedback?error=Unable+to+delete+feedback");
    }
};
