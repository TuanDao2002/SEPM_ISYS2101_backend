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

    const { quantity, price, vendor, prepareTime } = food;

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
        vendor,
        numberOfFood,
        totalPrice: price * numberOfFood,
        totalPrepareTime: prepareTime * numberOfFood,
    });

    res.status(StatusCodes.OK).json({ order });
};

const getOrders = async (req, res) => {
    let {
        user: { userId, role },
        query: { isFulfilled, next_cursor },
    } = req;

    if (role !== "student" && role !== "vendor") {
        return;
    }

    const queryObject = {};
    queryObject.isFulfilled = isFulfilled === "true" ? true : false;

    const resultsLimitPerLoading = 10;
    if (next_cursor) {
        const [createdAt, _id] = Buffer.from(next_cursor, "base64")
            .toString("ascii")
            .split("_");

        if (role === "student") {
            queryObject.user = userId;
            queryObject.createdAt = { $lte: createdAt };
            queryObject._id = { $lt: _id };
        } else if (role === "vendor") {
            queryObject.vendor = userId;
            queryObject.createdAt = { $gte: createdAt };
            queryObject._id = { $gt: _id };
        }
    }

    let orders = Order.find(queryObject)
        .populate({
            path: "user",
            select: "-_id username",
        })
        .populate({ path: "food", select: "_id foodName" })
        .populate({ path: "vendor", select: "-_id username" });

    if (role === "student") {
        orders = orders.sort("-createdAt -_id");
    } else if (role === "vendor") {
        orders = orders.sort("createdAt _id");
    }

    orders = orders.limit(resultsLimitPerLoading);
    const results = await orders;

    const count = await Order.countDocuments(queryObject);
    next_cursor = null;

    // if the there are still remaining results, create a cursor to load the next ones
    if (count !== results.length) {
        const lastResult = results[results.length - 1];
        next_cursor = Buffer.from(
            lastResult.createdAt.toISOString() + "_" + lastResult._id
        ).toString("base64");
    }

    res.status(StatusCodes.OK).json({ results, next_cursor });
};

const fulfillOrder = async (req, res) => {
    const {
        user: { userId },
        params: { id: orderId },
    } = req;

    const order = await Order.findOne({ _id: orderId, vendor: userId });
    if (!order) {
        throw new CustomError.BadRequestError(
            "This order does not exist or this vendor does not own this order"
        );
    }

    order.isFulfilled = true;
    await order.save();

    res.status(StatusCodes.OK).json({ msg: "Order is fulfilled" });
};

module.exports = { openFoodOrder, orderFood, getOrders, fulfillOrder };
