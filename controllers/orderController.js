const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

const Order = require("../models/Order");
const Food = require("../models/Food");
const User = require("../models/User");

const { paymentWithMomo, createJWT } = require("../utils/index");
const { notifySocket } = require("../socket/socket");

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

const closeFoodOrder = async (req, res) => {
    const {
        body: { foodId },
        user: { userId },
    } = req;

    const food = await Food.findOne({ _id: foodId, vendor: userId });
    if (!food) {
        throw new CustomError.BadRequestError(
            `Food with id ${foodId} does not exist or this vendor does not own this food`
        );
    }

    food.quantity = 0;
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

    let order = await Order.create({
        user: userId,
        food: foodId,
        vendor,
        numberOfFood,
        totalPrice: price * numberOfFood,
        totalPrepareTime: prepareTime * numberOfFood,
    });

    const findFood = await Food.findOne({ _id: foodId });
    findFood.quantity = findFood.quantity - numberOfFood;
    await findFood.save();

    let paymentResult = await paymentWithMomo(order._id, order.totalPrice);
    res.status(StatusCodes.OK).json({
        msg: "Please pay with Momo to complete the order",
        payUrl: paymentResult.payUrl,
    });
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

    const { isPaid } = order;
    if (!isPaid) {
        throw new CustomError.BadRequestError(
            "Cannot fulfill this order because it is not paid"
        );
    }

    order.isFulfilled = true;
    await order.save();

    res.status(StatusCodes.OK).json({ msg: "Order is fulfilled" });
};

const removeOrder = async (req, res) => {
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

    const { isPaid } = order;
    if (isPaid) {
        throw new CustomError.BadRequestError(
            "Cannot remove this order because it is already paid"
        );
    }

    await order.remove();
    res.status(StatusCodes.OK).json({ msg: "Order is removed" });
};

const getSubscriptionToken = async (req, res) => {
    const {
        user: { userId },
    } = req;

    const user = await User.findOne({ _id: userId, role: "vendor" });
    if (!user) {
        throw new CustomError.NotFoundError("Your account does not exist");
    }

    const { username, email, role } = user;

    const tokenUser = {
        username,
        email,
        userId,
        role,
    };

    const accessTokenJWT = createJWT(
        { payload: { tokenUser } },
        process.env.JWT_SECRET
    );

    res.status(StatusCodes.OK).json({ token: accessTokenJWT });
};

const momoReturn = async (req, res) => {
    const { orderId } = req.query;

    let order = await Order.findOne({ _id: orderId });
    order = await order
        .populate({
            path: "user",
            select: "-_id username",
        })
        .populate({ path: "food", select: "_id foodName" })
        .populate({ path: "vendor", select: "-_id username" })
        .execPopulate();

    if (!order) {
        throw new CustomError.NotFoundError("Order does not exist");
    }

    order.isPaid = true;
    await order.save();

    const {
        user: { username },
        food: { foodName },
        vendor: { _id: vendorId, username: vendorName },
        totalPrice,
        totalPrepareTime,
    } = order;

    // const findFood = await Food.findOne({ _id: food });
    // findFood.quantity = findFood.quantity - numberOfFood;
    // await findFood.save();

    notifySocket(req.app.io, vendorId, order);

    res.status(StatusCodes.OK).redirect(
        `${process.env.REACT_APP_LINK}?user=${username}&&food=${foodName}&&vendor=${vendorName}&&totalPrice=${totalPrice}&&totalPrepareTime=${totalPrepareTime}`
    );
};

module.exports = {
    openFoodOrder,
    closeFoodOrder,
    orderFood,
    getOrders,
    fulfillOrder,
    removeOrder,
    getSubscriptionToken,
    momoReturn,
};
