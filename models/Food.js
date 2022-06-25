const mongoose = require("mongoose");

const FoodSchema = new mongoose.Schema({
    foodName: {
        type: String,
        required: [true, "Please provide the food name"]
    },

    location: {
        type: String,
        required: [true, "Please provide the location"]
    },

    price: {
        type: Number,
        required: [true, "Please provide the price"]
    },

    category: {
        type: String,
        enum: ["Noodles", "Rice", "Soup"],
        message: '{VALUE} is not supported' // Error message
    },

    type: {
        type: String,
        enumm: ["Breakfast", "Lunch", "Dinner"],
        message: '{VALUE} is not supported' // Error message
    },

    image: {
        type: String,
        default: 'image'
    }
})


module.exports = mongoose.model('Food', FoodSchema)