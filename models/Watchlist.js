const mongoose = require("mongoose");


// ==================================================
// WATCHLIST SCHEMA
// ==================================================

const watchlistSchema = new mongoose.Schema(
    {

        // ------------------------------------------
        // USER
        // ------------------------------------------

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },


        // ------------------------------------------
        // PRODUCT
        // ------------------------------------------

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
// PREVENT DUPLICATE PRODUCT IN SAME USER WATCHLIST
// ==================================================

watchlistSchema.index(
    {
        user: 1,
        product: 1
    },
    {
        unique: true
    }
);


// ==================================================
// EXPORT MODEL
// ==================================================

module.exports =
    mongoose.model(
        "Watchlist",
        watchlistSchema
    );