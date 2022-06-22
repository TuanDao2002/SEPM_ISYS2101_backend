const mongoose = require("mongoose");

const IPSchema = new mongoose.Schema({
    ipAddress: {
        type: String,
        required: true,
    },

    loginAttempts: {
        type: Number,
        required: true,
        default: 1,
    },

    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    },

    status: {
        type: Boolean,
        default: true,
    },
});

module.exports = mongoose.model("IP", IPSchema);
