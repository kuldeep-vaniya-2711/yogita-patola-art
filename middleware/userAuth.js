const User = require("../models/User");


// ==================================================
// USER AUTHENTICATION MIDDLEWARE
// ==================================================

const userAuth = async (req, res, next) => {

    try {

        // ==========================================
        // CHECK SESSION
        // ==========================================

        if (
            !req.session ||
            !req.session.userId
        ) {

            console.log(
                "USER LOGIN REQUIRED"
            );

            console.log(
                "Requested URL:",
                req.originalUrl
            );


            // ======================================
            // SAVE ORIGINAL URL
            // ======================================

            const redirectUrl =
                encodeURIComponent(
                    req.originalUrl
                );


            // ======================================
            // REDIRECT LOGIN
            // ======================================

            return res.redirect(
                `/user/login?redirect=${redirectUrl}`
            );

        }


        // ==========================================
        // FIND USER
        // ==========================================

        const user =
            await User.findById(
                req.session.userId
            );


        // ==========================================
        // USER NOT FOUND
        // ==========================================

        if (!user) {

            console.log(
                "USER NOT FOUND FOR SESSION"
            );


            // Destroy invalid session

            return req.session.destroy(
                () => {

                    return res.redirect(
                        "/user/login"
                    );

                }
            );

        }


        // ==========================================
        // ATTACH USER TO REQUEST
        // ==========================================

        req.user = user;


        // ==========================================
        // USER AUTHENTICATED
        // ==========================================

        console.log(
            "USER AUTHENTICATED"
        );

        console.log(
            "User ID:",
            user._id.toString()
        );

        console.log(
            "User Name:",
            user.name
        );

        console.log(
            "User Email:",
            user.email
        );


        // ==========================================
        // CONTINUE
        // ==========================================

        return next();


    } catch (error) {

        console.error(
            "User authentication error:",
            error
        );


        // ==========================================
        // AUTH ERROR
        // ==========================================

        return res.status(500).send(
            "Unable to authenticate user."
        );

    }

};


// ==================================================
// EXPORT
// ==================================================

module.exports = userAuth;