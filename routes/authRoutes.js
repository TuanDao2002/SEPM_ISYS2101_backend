const express = require("express");
const router = express.Router();

const {
    register,
    verifyEmail,
    login,
    verifyOTP,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/login", login);
router.post("/verify-OTP", verifyOTP);

module.exports = router;
