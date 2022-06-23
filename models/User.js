const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Please provide username"],
        unique: true,
    },

    email: {
        type: String,
        required: [true, "Please provide email"],
        unique: true,
    },

    role: {
        type: String,
        enum: ["vendor", "student"],
    },
});

module.exports = mongoose.model("User", UserSchema);
