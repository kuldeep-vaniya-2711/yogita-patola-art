const Visitor = require("../models/Visitor");


// ==================================================
// GET CLIENT IP
// ==================================================

function getClientIP(req) {

    let ip =
        req.headers["x-forwarded-for"] ||
        req.headers["x-real-ip"] ||
        req.socket.remoteAddress ||
        req.ip ||
        "Unknown";


    // x-forwarded-for me multiple IP ho sakti hain
    if (
        typeof ip === "string" &&
        ip.includes(",")
    ) {

        ip = ip
            .split(",")[0]
            .trim();

    }


    // IPv6 localhost
    if (ip === "::1") {

        ip = "127.0.0.1";

    }


    // IPv4 mapped IPv6
    if (
        typeof ip === "string" &&
        ip.startsWith("::ffff:")
    ) {

        ip = ip.replace(
            "::ffff:",
            ""
        );

    }


    return ip || "Unknown";

}


// ==================================================
// GET BROWSER
// ==================================================

function getBrowser(userAgent) {

    if (!userAgent) {

        return "Unknown";

    }


    if (
        userAgent.includes("Edg/")
    ) {

        return "Microsoft Edge";

    }


    if (
        userAgent.includes("OPR/") ||
        userAgent.includes("Opera")
    ) {

        return "Opera";

    }


    if (
        userAgent.includes("Chrome/") &&
        !userAgent.includes("Edg/")
    ) {

        return "Google Chrome";

    }


    if (
        userAgent.includes("Firefox/")
    ) {

        return "Mozilla Firefox";

    }


    if (
        userAgent.includes("Safari/") &&
        !userAgent.includes("Chrome/") &&
        !userAgent.includes("Chromium/")
    ) {

        return "Safari";

    }


    return "Other";

}


// ==================================================
// GET DEVICE
// ==================================================

function getDevice(userAgent) {

    if (!userAgent) {

        return "Unknown";

    }


    const mobileKeywords = [

        "Mobile",
        "Android",
        "iPhone",
        "iPad",
        "iPod"

    ];


    const isMobile =
        mobileKeywords.some(
            keyword =>
                userAgent.includes(keyword)
        );


    if (isMobile) {

        return "Mobile";

    }


    return "Desktop";

}


// ==================================================
// CHECK TRACKABLE PAGE
// ==================================================

function shouldTrack(req) {

    // ----------------------------------------------
    // Only GET requests
    // ----------------------------------------------

    if (
        req.method !== "GET"
    ) {

        return false;

    }


    const path =
        req.path.toLowerCase();


    // ----------------------------------------------
    // Ignore admin
    // ----------------------------------------------

    if (
        path.startsWith("/admin")
    ) {

        return false;

    }


    // ----------------------------------------------
    // Ignore uploads
    // ----------------------------------------------

    if (
        path.startsWith("/uploads")
    ) {

        return false;

    }


    // ----------------------------------------------
    // Ignore static files
    // ----------------------------------------------

    const ignoredPaths = [

        "/css",
        "/js",
        "/images",
        "/fonts",
        "/favicon",
        "/assets"

    ];


    for (
        const ignoredPath of ignoredPaths
    ) {

        if (
            path.startsWith(ignoredPath)
        ) {

            return false;

        }

    }


    // ----------------------------------------------
    // Ignore common file extensions
    // ----------------------------------------------

    const ignoredExtensions = [

        ".css",
        ".js",
        ".png",
        ".jpg",
        ".jpeg",
        ".webp",
        ".gif",
        ".svg",
        ".ico",
        ".woff",
        ".woff2",
        ".ttf",
        ".map"

    ];


    for (
        const extension of ignoredExtensions
    ) {

        if (
            path.endsWith(extension)
        ) {

            return false;

        }

    }


    return true;

}


// ==================================================
// VISITOR TRACKER MIDDLEWARE
// ==================================================

async function visitorTracker(
    req,
    res,
    next
) {

    // ------------------------------------------------
    // IMPORTANT:
    // Visitor tracking should NEVER stop website
    // ------------------------------------------------

    try {

        // --------------------------------------------
        // CHECK WHETHER REQUEST SHOULD BE TRACKED
        // --------------------------------------------

        if (
            !shouldTrack(req)
        ) {

            return next();

        }


        // --------------------------------------------
        // USER AGENT
        // --------------------------------------------

        const userAgent =
            req.headers["user-agent"] ||
            "Unknown";


        // --------------------------------------------
        // VISITOR DATA
        // --------------------------------------------

        const visitorData = {

            ipAddress:
                getClientIP(req),

            page:
                req.originalUrl ||
                req.path,

            method:
                req.method,

            referrer:
                req.headers.referer ||
                req.headers.referrer ||
                "Direct",

            browser:
                getBrowser(userAgent),

            device:
                getDevice(userAgent),

            userAgent:
                userAgent,

            visitDate:
                new Date()

        };


        // --------------------------------------------
        // SAVE TO MONGODB
        // --------------------------------------------

        const visitor =
            await Visitor.create(
                visitorData
            );


        // --------------------------------------------
        // SUCCESS LOG
        // --------------------------------------------

        console.log(
            "================================"
        );

        console.log(
            "Visitor tracked successfully"
        );

        console.log(
            "Visitor ID:",
            visitor._id.toString()
        );

        console.log(
            "IP:",
            visitorData.ipAddress
        );

        console.log(
            "Page:",
            visitorData.page
        );

        console.log(
            "Browser:",
            visitorData.browser
        );

        console.log(
            "Device:",
            visitorData.device
        );

        console.log(
            "================================"
        );


    } catch (error) {

        // --------------------------------------------
        // IMPORTANT:
        // Visitor tracking error must NOT crash
        // the website
        // --------------------------------------------

        console.error(
            "================================"
        );

        console.error(
            "Visitor tracking error:"
        );

        console.error(
            error.message
        );

        console.error(
            "================================"
        );

    }


    // ----------------------------------------------
    // CONTINUE REQUEST
    // ----------------------------------------------

    next();

}


// ==================================================
// EXPORT
// ==================================================

module.exports =
    visitorTracker;