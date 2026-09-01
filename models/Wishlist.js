const mongoose = require("mongoose");


// ==================================================
// WISHLIST SCHEMA
// ==================================================

const wishlistSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        }
    },
    {
        timestamps: true
    }
);


// ==================================================
// UNIQUE USER + PRODUCT
// ==================================================

wishlistSchema.index(
    {
        user: 1,
        product: 1
    },
    {
        unique: true
    }
);


// ==================================================
// EXPORT
// ==================================================

module.exports =
    mongoose.model(
        "Wishlist",
        wishlistSchema
    );