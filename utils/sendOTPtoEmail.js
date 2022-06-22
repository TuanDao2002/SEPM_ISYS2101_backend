const sendEmail = require('./sendEmail');

const sendOTPtoEmail = async (email, otp) => {
    const html = `<center><h3>Your OTP to login is:</h3></center><center><strong><h1>${otp}</h1></strong></center>`
    return sendEmail(email, "OTP for login", html)
};

module.exports = sendOTPtoEmail;
