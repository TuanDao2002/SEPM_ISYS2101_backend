const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Please provide username"],
    },

    email: {
        type: String,
        unique: true,
        required: [true, "Please provide email"],
    },

    role: {
        type: String,
        enum: ["vendor", "student"],
    },

    verificationToken: String,

    isVerified: {
        type: Boolean,
        default: false,
    },
});

module.exports = mongoose.model("User", UserSchema);
