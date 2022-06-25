const mongoose = require("mongoose");

const FoodSchema = new mongoose.Schema({
    foodName: {
        type: String,
        required: [true, "Please provide the food name"],
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
            values: ["Noodles", "Rice", "Soup"],
            message: "{VALUE} is not supported", // Error message
        },
    },

    type: {
        type: String,
        enum: {
            values: ["Breakfast", "Lunch", "Dinner"],
            message: "{VALUE} is not supported", // Error message
        },
    },

    taste: {
        type: String,
        enum: {
            values: ["Sweet", "Sour", "Bitter", "Salty"],
            message: "{VALUE} is not supported", // Error message
        },
    },

    image: {
        type: String,
        default: "image",
    },
});

module.exports = mongoose.model("Food", FoodSchema);
