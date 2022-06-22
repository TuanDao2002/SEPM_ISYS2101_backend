const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please provide username'],
    },

    role: {
        type: String,
        enum: ['admin', 'user']
    },
});

module.exports = mongoose.model('User', UserSchema)
