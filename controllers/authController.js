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

const useragent = require("express-useragent");
const crypto = require("crypto");

const register = async (req, res) => {
    const {
        body: { username },
        ip,
    } = req;

    const role = checkRole(username);
    const email =
        role === "student"
            ? "s" + username + "@rmit.edu.vn"
            : role + "@gmail.com";

    const findUser = await User.findOne({ email });
    if (findUser) {
        throw new CustomError.BadRequestError("This account already exists");
    }

    const verificationToken = crypto.randomBytes(40).toString("hex");

    const user = await User.create({
        username,
        email,
        role,
        verificationToken,
    });

    const origin = "http://localhost:3000"; // later this is the origin link of React client side
    await sendVerificationEmail(email, verificationToken, origin);

    res.status(StatusCodes.CREATED).json({
        msg: "Success! Please check your email to verify your account",
    });
};

const verifyEmail = async (req, res) => {
    const { verificationToken, email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        throw new CustomError.UnauthenticatedError('Verification Failed')
    }

    if (user.verificationToken != verificationToken) {
        throw new CustomError.UnauthenticatedError('Verification Failed')
    }

    user.isVerified = true;
    user.verificationToken = '';

    await user.save();

    res.json({ msg: "success" });
};

const login = async (req, res) => {};

const verifyOTP = async (req, res) => {};

module.exports = {
    register,
    verifyEmail,
    login,
    verifyOTP,
};
