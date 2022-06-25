const express = require("express");
const router = express.Router();

const { authenticateUser } = require("../middleware/authentication");

const {
    register,
    verifyEmail,
    login,
    verifyOTP,
    logout
} = require("../controllers/authController");

router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/login", login);
router.post("/verify-OTP", verifyOTP);
router.delete("/logout", authenticateUser, logout);

module.exports = router;
