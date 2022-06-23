const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const {
    createJWT,
    isTokenValid,
    makeToken,
    checkRole,
    generateOTP,
    sendOTPtoEmail,
    sendVerificationEmail,
} = require("../utils");

const User = require("../models/User");
const IP = require("../models/IP");

const useragent = require("express-useragent");

const register = async (req, res) => {
    const {
        body: { username },
    } = req;

    const findUser = await User.findOne({ username });
    if (findUser) {
        throw new CustomError.BadRequestError("This account already exists");
    }

    const verificationToken = makeToken(username);

    const origin = "http://localhost:3000"; // later this is the origin link of React client side
    await sendVerificationEmail(req.useragent.browser, username, verificationToken, origin);

    res.status(StatusCodes.CREATED).json({
        msg: "Please check your email to verify your account!",
    });
};

const verifyEmail = async (req, res) => {
    const { verificationToken } = req.body;
    if (!verificationToken) {
        throw new CustomError.UnauthenticatedError("Cannot verify user");
    }

    let decoded;
    try {
        decoded = isTokenValid(verificationToken);
    } catch {
        throw new CustomError.UnauthenticatedError("Verification Failed");
    }

    if (
        !decoded.hasOwnProperty("username") ||
        !decoded.hasOwnProperty("expirationDate")
    ) {
        throw new CustomError.UnauthenticatedError("Verification Failed");
    }

    const { username, expirationDate } = decoded;
    const now = new Date()

    if (new Date(expirationDate).getTime() <= now.getTime()) {
        throw new CustomError.UnauthenticatedError(
            "Verification token is expired"
        );
    }

    const findUser = await User.findOne({ username });
    if (findUser) {
        throw new CustomError.BadRequestError("This account already exists");
    }

    const role = checkRole(username);
    const email =
        role === "student"
            ? "s" + username + "@rmit.edu.vn"
            : role + "@gmail.com";

    const user = await User.create({
        username,
        email,
        role,
    });

    res.status(StatusCodes.OK).json({ msg: `Account with username: ${user.username} is created!` });
};

const login = async (req, res) => {

};

const verifyOTP = async (req, res) => {};

module.exports = {
    register,
    verifyEmail,
    login,
    verifyOTP,
};
