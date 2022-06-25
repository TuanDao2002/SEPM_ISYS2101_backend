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
        enum: {
            values: ["vendor", "student"],
            message: "{VALUE} is not supported",
        },
    },

    ipAddresses: {
        type: [String],
        validate: [(val) => val.length >= 1, "Must have at least 1 IP"],
    },
});

module.exports = mongoose.model("User", UserSchema);
