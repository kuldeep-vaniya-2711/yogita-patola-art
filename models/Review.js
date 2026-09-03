
const mongoose = require("mongoose");


// ==================================================
// REVIEW SCHEMA
// ==================================================

const reviewSchema = new mongoose.Schema(
    {

        // ------------------------------------------
        // PRODUCT
        // ------------------------------------------

        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },


        // ------------------------------------------
        // USER
        // ------------------------------------------

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },


        // ------------------------------------------
        // USER NAME
        // ------------------------------------------

        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 50
        },


        // ------------------------------------------
        // USER EMAIL
        // ------------------------------------------

        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },


        // ------------------------------------------
        // RATING
        // ------------------------------------------

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },


        // ------------------------------------------
        // REVIEW COMMENT
        // ------------------------------------------

        comment: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 500
        },


        // ------------------------------------------
        // APPROVAL STATUS
        // ------------------------------------------
        //
        // false = Pending
        // true  = Approved
        //
        // This is the ONLY field used to determine
        // whether a review is approved or pending.
        // ------------------------------------------

        approved: {
            type: Boolean,
            default: false
        }

    },


    // ------------------------------------------
    // TIMESTAMPS
    // ------------------------------------------

    {
        timestamps: true
    }
);


// ==================================================
// MODEL
// ==================================================

const Review =
    mongoose.model(
        "Review",
        reviewSchema
    );


// ==================================================
// EXPORT
// ==================================================

module.exports = Review;

