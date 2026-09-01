const dotenv = require("dotenv");
const mongoose = require("mongoose");

const Product = require("./models/Product");

dotenv.config();


// ========================================
// CONNECT MONGODB
// ========================================

mongoose
    .connect(process.env.MONGODB_URI)
    .then(async () => {

        console.log(
            "MongoDB connected"
        );


        // ========================================
        // CREATE PRODUCT
        // ========================================

        const product = await Product.create({

            name: "Royal Double Ikat Patola",

            category: "Double Ikat Patola",

            description:
                "A timeless handcrafted Patola saree inspired by the rich textile heritage of Gujarat. Woven with intricate motifs, vibrant colors and traditional craftsmanship.",

            price: 24500,

            fabric: "Pure Silk",

            technique: "Double Ikat",

            color: "Royal Red & Green",

            dimensions: "5.5 Meter Saree + Blouse Piece",

            availability: "In Stock",

            images: [
                "/images/products/patola-1.jpg"
            ],

            featured: true
        });


        console.log(
            "Product added successfully!"
        );

        console.log(product);


        // ========================================
        // CLOSE CONNECTION
        // ========================================

        await mongoose.connection.close();

        console.log(
            "MongoDB connection closed"
        );

    })

    .catch((error) => {

        console.error(
            "Error:",
            error.message
        );

    });