const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const {
    checkRole,
    generateOTP,
    sendOTPtoEmail,
    sendVerificationEmail,
} = require("../utils");

const User = require("../models/User");
const IP = require("../models/IP");

const useragent = require('express-useragent');

const login = async (req, res) => {
    const {
        body: { username },
        ip,
    } = req;

    const role = checkRole(username);
    const email =
        role === "student"
            ? "s" + username + "@rmit.edu.vn"
            : role + "@gmail.com";

    const findUser = await User.findOne({ username: email });
    if (findUser) {
        const otp = generateOTP();
        await sendOTPtoEmail(email, otp);
        res.status(StatusCodes.OK).json({ email });

        // const findIP = await IP.findOne({ ipAddress: ip });
        // if (!findIP || findIP.user != findUser._id) {
        // }
    }

    await sendVerificationEmail(email, req.useragent.browser);

    res.status(StatusCodes.NOT_ACCEPTABLE).json({
        msg: "New login from this device. Check email to verify",
    });
};

const verifyOTP = async (req, res) => {};

module.exports = {
    login,
    verifyOTP,
};
