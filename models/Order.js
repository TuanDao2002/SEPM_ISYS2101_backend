const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true,
        },

        food: {
            type: mongoose.Types.ObjectId,
            ref: "Food",
            required: true,
        },

        vendor: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true,
        },

        numberOfFood: {
            type: Number,
            min: [1, "You must order more than 1"],
            required: true,
        },

        totalPrice: {
            type: Number,
            required: true,
        },

        totalPrepareTime: {
            type: Number,
            required: true,
        },

        isFulfilled: {
            type: Boolean,
            default: false,
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
