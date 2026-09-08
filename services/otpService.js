function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function getOTPExpiry() {
    return new Date(Date.now() + 5 * 60 * 1000);
}

function isOTPExpired(expiry) {
    return !expiry || new Date() > new Date(expiry);
}

module.exports = {
    generateOTP,
    getOTPExpiry,
    isOTPExpired
};