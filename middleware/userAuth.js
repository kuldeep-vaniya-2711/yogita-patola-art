const User = require("../models/User");

const userAuth = async (req, res, next) => {
    try {
        if (!req.session?.userId) {
            console.log("USER LOGIN REQUIRED\nRequested URL:", req.originalUrl);
            const redirectUrl = encodeURIComponent(req.originalUrl);
            return res.redirect(`/user/login?redirect=${redirectUrl}`);
        }

        const user = await User.findById(req.session.userId);
        if (!user) {
            console.log("USER NOT FOUND FOR SESSION");
            return req.session.destroy(() => res.redirect("/user/login"));
        }

        req.user = user;
        console.log("USER AUTHENTICATED\nUser ID:", user._id.toString(), "\nUser Name:", user.name, "\nUser Email:", user.email);
        return next();
    } catch (error) {
        console.error("User authentication error:", error);
        return res.status(500).send("Unable to authenticate user.");
    }
};

module.exports = userAuth;