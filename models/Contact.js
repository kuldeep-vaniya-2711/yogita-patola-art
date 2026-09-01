const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100
        },

        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            maxlength: 150
        },

        phone: {
            type: String,
            trim: true,
            default: "",
            maxlength: 30
        },

        subject: {
            type: String,
            trim: true,
            default: "General Inquiry",
            maxlength: 150
        },

        message: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 2000
        },

        status: {
            type: String,
            enum: ["unread", "read", "replied"],
            default: "unread"
        },

        isRead: {
            type: Boolean,
            default: false
        },

        isReplied: {
            type: Boolean,
            default: false
        },

        adminReply: {
            type: String,
            trim: true,
            default: ""
        },

        repliedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

contactSchema.index({ createdAt: -1 });
contactSchema.index({ status: 1 });
contactSchema.index({ isRead: 1 });
contactSchema.index({ email: 1 });

module.exports = mongoose.model(
    "Contact",
    contactSchema
);