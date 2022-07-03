const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
    {
        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: [true, "Please provide the rating"],
        },

        title: {
            type: String,
            trim: true,
            required: [true, "Please provide the title"],
            maxlength: 100,
        },

        comment: {
            type: String,
            required: [true, "Please provide the comment"],
            maxlength: 100,
        },

        user: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true,
        },

        food: {
            type: mongoose.Schema.ObjectId,
            ref: "Food",
            required: true,
        },
    },
    { timestamps: true }
);

ReviewSchema.index({ food: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Review", ReviewSchema);
