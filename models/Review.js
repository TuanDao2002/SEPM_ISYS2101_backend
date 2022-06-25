const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    rating: {
        type: Number,
        required: [true, 'Please provide the rating']
    },

    title: {
        type: String,
        required: [true, 'Please provide the title']
    },

    comment: {
        type: String,
        required: [true, 'Please provide the comment']
    },

}, {
    timestamps: true,
}

)

module.exports = mongoose.model('Review', ReviewSchema)