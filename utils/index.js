const checkRole = require('./checkRole')
const generateOTP = require('./generateOTP')
const sendOTPtoEmail = require('./sendOTPtoEmail')
const sendVerificationEmail = require('./sendVerificationEmail')

module.exports = {
    checkRole,
    generateOTP,
    sendOTPtoEmail,
    sendVerificationEmail
}