const mongoose = require("mongoose");

const FoodSchema = new mongoose.Schema(
    {
        foodName: {
            type: String,
            required: [true, "Please provide the food name"],
            minlength: [3, "Length must be greater than 3"],
            maxlength: [20, "Length must be less than 20"],
            trim: true,
            unique: true,
        },

        vendor: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true,
        },

        location: {
            type: String,
            required: [true, "Please provide the location"],
            minlength: [3, "Length must be greater than 3"],
            maxlength: [20, "Length must be less than 20"],
            trim: true,
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

        prepareTime: {
            type: Number,
            min: [1, "Time to prepare must be longer than 0 minute"],
            max: [59, "Time to prepare must be shorter than 60 minutes"],
            required: true,
        },

        averageRating: {
            type: Number,
            default: 0,
        },

        weightRating: {
            type: Number,
            default: 0,
        },

        numOfReviews: {
            type: Number,
            default: 0,
        },

        image: {
            type: String,
            trim: true,
            default: "image",
        },
    },
    { timestamps: true }
);

FoodSchema.index({ vendor: 1 }, { price: 1, createdAt: -1 });

FoodSchema.pre("remove", async function () {
    await this.model("Review").deleteMany({ food: this._id });
});

module.exports = mongoose.model("Food", FoodSchema);
