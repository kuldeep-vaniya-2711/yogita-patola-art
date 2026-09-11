const Visitor = require("../models/Visitor");

function getClientIP(req) {
    let ip = req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || req.socket.remoteAddress || req.ip || "Unknown";
    if (typeof ip === "string" && ip.includes(",")) {
        ip = ip.split(",")[0].trim();
    }
    if (ip === "::1") ip = "127.0.0.1";
    if (typeof ip === "string" && ip.startsWith("::ffff:")) {
        ip = ip.replace("::ffff:", "");
    }
    return ip || "Unknown";
}

function getBrowser(userAgent) {
    if (!userAgent) return "Unknown";
    if (userAgent.includes("Edg/")) return "Microsoft Edge";
    if (userAgent.includes("OPR/") || userAgent.includes("Opera")) return "Opera";
    if (userAgent.includes("Chrome/") && !userAgent.includes("Edg/")) return "Google Chrome";
    if (userAgent.includes("Firefox/")) return "Mozilla Firefox";
    if (userAgent.includes("Safari/") && !userAgent.includes("Chrome/") && !userAgent.includes("Chromium/")) return "Safari";
    return "Other";
}

function getDevice(userAgent) {
    if (!userAgent) return "Unknown";
    const mobileKeywords = ["Mobile", "Android", "iPhone", "iPad", "iPod"];
    return mobileKeywords.some(k => userAgent.includes(k)) ? "Mobile" : "Desktop";
}

const IGNORED_PREFIXES = ["/admin", "/uploads", "/css", "/js", "/images", "/fonts", "/favicon", "/assets"];
const IGNORED_EXTS = [".css", ".js", ".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".ico", ".woff", ".woff2", ".ttf", ".map"];

function shouldTrack(req) {
    if (req.method !== "GET") return false;
    const path = req.path.toLowerCase();
    if (IGNORED_PREFIXES.some(prefix => path.startsWith(prefix))) return false;
    if (IGNORED_EXTS.some(ext => path.endsWith(ext))) return false;
    return true;
}

async function visitorTracker(req, res, next) {
    try {
        if (!shouldTrack(req)) return next();

        const userAgent = req.headers["user-agent"] || "Unknown";
        const visitorData = {
            ipAddress: getClientIP(req),
            page: req.originalUrl || req.path,
            method: req.method,
            referrer: req.headers.referer || req.headers.referrer || "Direct",
            browser: getBrowser(userAgent),
            device: getDevice(userAgent),
            userAgent,
            visitDate: new Date()
        };

        const visitor = await Visitor.create(visitorData);
         console.log("================================\nVisitor tracked successfully");
        // console.log("Visitor ID:", visitor._id.toString());
        // console.log("IP:", visitorData.ipAddress);
        // console.log("Page:", visitorData.page);
        // console.log("Browser:", visitorData.browser);
        // console.log("Device:", visitorData.device);
        // console.log("================================");
    } catch (error) {
        console.error("================================\nVisitor tracking error:\n", error.message, "\n================================");
    }
    next();
}

module.exports = visitorTracker;