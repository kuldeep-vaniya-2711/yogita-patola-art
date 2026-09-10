const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
    {
        // Website Info
        siteName: { type: String, default: "Yogita Patola Art" },
        siteDescription: { type: String, default: "Handcrafted Patola Sarees and Traditional Indian Textiles" },
        siteEmail: { type: String, default: "" },
        sitePhone: { type: String, default: "" },

        // SEO
        metaTitle: { type: String, default: "Yogita Patola Art | Handcrafted Patola Sarees" },
        metaDescription: { type: String, default: "Discover handcrafted Patola sarees and traditional Indian textiles by Yogita Patola Art." },
        metaKeywords: { type: String, default: "Patola sarees, handcrafted Patola, traditional textiles, Indian sarees, Yogita Patola Art" },
        faviconUrl: { type: String, default: "" },

        // Home Page Content
        heroHeading: { type: String, default: "Woven Heritage, Timeless Beauty." },
        heroDescription: { type: String, default: "Discover the elegance of handcrafted Patola textiles, where centuries-old Indian artistry meets contemporary sophistication." },
        heroImage: { type: String, default: "" },

        aboutHeading: { type: String, default: "Preserving Tradition. Creating Legacy." },
        aboutDescription: { type: String, default: "At Yogita Patola Art, we believe that traditional Indian textiles deserve to be experienced, celebrated and preserved." },
        aboutImage: { type: String, default: "" },

        // About / Our Story Page
        aboutStoryImage: { type: String, default: "" },

        // Heritage Section Images
        heritageHandcraftedImage: { type: String, default: "" },
        heritageIntricateImage: { type: String, default: "" },
        heritageTimelessImage: { type: String, default: "" },

        // Contact & Social
        address: { type: String, default: "" },
        whatsapp: { type: String, default: "" },
        instagram: { type: String, default: "" },
        facebook: { type: String, default: "" },
        youtube: { type: String, default: "" },

        // Website Status & Toggles
        maintenanceMode: { type: Boolean, default: false },
        showContact: { type: Boolean, default: true },
        showFeedback: { type: Boolean, default: true },
        showReviews: { type: Boolean, default: true }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);