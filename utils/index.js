const { createJWT, isTokenValid } = require("./jwt");
const makeToken = require("./makeToken")
const checkRole = require("./checkRole");
const generateOTP = require("./generateOTP");
const sendOTPtoEmail = require("./sendOTPtoEmail");
const sendVerificationEmail = require("./sendVerificationEmail");

module.exports = {
    createJWT,
    isTokenValid,
    makeToken,
    checkRole,
    generateOTP,
    sendOTPtoEmail,
    sendVerificationEmail,
};
