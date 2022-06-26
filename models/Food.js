const mongoose = require("mongoose");

const FoodSchema = new mongoose.Schema({
    foodName: {
        type: String,
        required: [true, "Please provide the food name"],
    },

    vendor: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    },

    location: {
        type: String,
        required: [true, "Please provide the location"],
    },

    price: {
        type: Number,
        required: [true, "Please provide the price"],
    },

    category: {
        type: String,
        enum: {
            values: ["Noodle", "Rice", "Soup", "Bread", "Desert"],
            message: "{VALUE} is not a supported category", // Error message
        },
    },

    type: {
        type: String,
        enum: {
            values: ["Breakfast", "Lunch", "Dinner"],
            message: "{VALUE} is not a supported type of meal", // Error message
        },
    },

    taste: {
        type: [String],
        enum: {
            values: ["Sweet", "Sour", "Bitter", "Salty"],
            message: "{VALUE} is not a supported type of taste", // Error message
        },
    },

    image: {
        type: String,
        default: "image",
    },
});

FoodSchema.index({ vendor: 1 }, { unique: true });

module.exports = mongoose.model("Food", FoodSchema);
