const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

const Order = require("../models/Order");
const Food = require("../models/Food");
const User = require("../models/User");

const openFoodOrder = async (req, res) => {
    const {
        body: { foodId, quantity },
        user: { userId },
    } = req;

    const food = await Food.findOne({ _id: foodId, vendor: userId });
    if (!food) {
        throw new CustomError.BadRequestError(
            `Food with id ${foodId} does not exist or this vendor does not own this food`
        );
    }

    food.quantity = quantity;
    await food.save();

    res.status(StatusCodes.OK).json({ food });
};

const orderFood = async (req, res) => {
    const {
        body: { foodId, numberOfFood },
        user: { userId },
    } = req;

    const food = await Food.findOne({ _id: foodId });
    if (!food) {
        throw new CustomError.NotFoundError(
            `Food with id ${foodId} does not exist`
        );
    }

    const { quantity, price } = food;

    if (quantity === 0) {
        throw new CustomError.BadRequestError(
            "This food is not available to order"
        );
    }

    if (numberOfFood === 0 || !numberOfFood) {
        throw new CustomError.BadRequestError(
            "The number of food must be set to order"
        );
    }

    if (numberOfFood > quantity) {
        throw new CustomError.BadRequestError(
            "The number of food to order exceeds the quantity of the food"
        );
    }

    food.quantity = quantity - numberOfFood;
    await food.save();

    const order = await Order.create({
        user: userId,
        food: foodId,
        numberOfFood,
        totalPrice: price * numberOfFood,
    });

    res.status(StatusCodes.OK).json({ order });
};

module.exports = { openFoodOrder, orderFood };
