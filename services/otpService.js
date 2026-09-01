// ==================================================
// OTP SERVICE
// ==================================================

// Generate a 6 digit OTP
function generateOTP() {

    return Math.floor(
        100000 +
        Math.random() * 900000
    ).toString();

}


// ==================================================
// OTP EXPIRY
// ==================================================

function getOTPExpiry() {

    // OTP valid for 5 minutes

    return new Date(
        Date.now() +
        5 * 60 * 1000
    );

}


// ==================================================
// VERIFY OTP EXPIRY
// ==================================================

function isOTPExpired(expiry) {

    if (!expiry) {

        return true;

    }

    return new Date() > new Date(expiry);

}


// ==================================================
// EXPORT
// ==================================================

module.exports = {

    generateOTP,

    getOTPExpiry,

    isOTPExpired

};