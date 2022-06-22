const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { checkRole, generateOTP, sendOTPtoEmail } = require("../utils");

const login = async (req, res) => {
    const { username } = req.body;
    const role = checkRole(username);

    const email = role === "student" ? "s" + username + "@rmit.edu.vn" : role + "@gmail.com"
    const otp = generateOTP();
    
    await sendOTPtoEmail(email, otp);

    res.status(StatusCodes.OK).json({
        msg: "Valid username! Please check your email for OTP to verify account"
    })
};

module.exports = login;
