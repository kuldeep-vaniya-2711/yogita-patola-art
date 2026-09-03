const mongoose = require("mongoose");


// ==================================================
// PRODUCT SCHEMA
// ==================================================

const productSchema =
    new mongoose.Schema(
        {

            // ==================================================
            // PRODUCT NAME
            // ==================================================

            name: {

                type: String,

                required: [
                    true,
                    "Product name is required"
                ],

                trim: true

            },


            // ==================================================
            // CATEGORY
            // ==================================================

            category: {

                type: String,

                required: [
                    true,
                    "Product category is required"
                ],

                trim: true

            },


            // ==================================================
            // DESCRIPTION
            // ==================================================

            description: {

                type: String,

                trim: true,

                default: ""

            },


            // ==================================================
            // PRICE
            // ==================================================

            price: {

                type: Number,

                default: 0,

                min: 0

            },


            // ==================================================
            // FABRIC
            // ==================================================

            fabric: {

                type: String,

                trim: true,

                default: ""

            },


            // ==================================================
            // TECHNIQUE
            // ==================================================

            technique: {

                type: String,

                trim: true,

                default: ""

            },


            // ==================================================
            // COLOR
            // ==================================================

            color: {

                type: String,

                trim: true,

                default: ""

            },


            // ==================================================
            // DIMENSIONS
            // ==================================================

            dimensions: {

                type: String,

                trim: true,

                default: ""

            },


            // ==================================================
            // AVAILABILITY
            // ==================================================

            availability: {

                type: String,

                enum: {

                    values: [
                        "In Stock",
                        "Limited",
                        "Out of Stock",
                        "Hidden"
                    ],

                    message:
                        "{VALUE} is not a valid availability option."

                },

                default: "In Stock"

            },


            // ==================================================
            // PRODUCT IMAGES
            // ==================================================

            images: {

                type: [String],

                default: []

            },


            // ==================================================
            // FEATURED PRODUCT
            // ==================================================

            featured: {

                type: Boolean,

                default: false

            },


            // ==================================================
            // AVERAGE RATING
            // ==================================================

            averageRating: {

                type: Number,

                default: 0,

                min: 0,

                max: 5

            },


            // ==================================================
            // REVIEW COUNT
            // ==================================================

            reviewCount: {

                type: Number,

                default: 0,

                min: 0

            }

        },


        // ==================================================
        // TIMESTAMPS
        // ==================================================

        {
            timestamps: true
        }

    );


// ==================================================
// EXPORT MODEL
// ==================================================

module.exports =
    mongoose.model(
        "Product",
        productSchema
    );