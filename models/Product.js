const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: [true, "Product name is required"], trim: true },
        category: { type: String, required: [true, "Product category is required"], trim: true },
        description: { type: String, trim: true, default: "" },
        price: { type: Number, default: 0, min: 0 },

        discountEnabled: {
    type: Boolean,
    default: false
},

discountPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
},

        fabric: { type: String, trim: true, default: "" },
        technique: { type: String, trim: true, default: "" },
        color: { type: String, trim: true, default: "" },
        dimensions: { type: String, trim: true, default: "" },
        availability: {
            type: String,
            enum: {
                values: ["In Stock", "Limited", "Out of Stock"],
                message: "{VALUE} is not a valid availability option."
            },
            default: "In Stock"
        },
        images: { type: [String], default: [] },
        featured: { type: Boolean, default: false },
        averageRating: { type: Number, default: 0, min: 0, max: 5 },
        reviewCount: { type: Number, default: 0, min: 0 }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);