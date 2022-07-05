const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const validator = require("validator");

const Food = require("../models/Food");
const User = require("../models/User");

// regex check if there are characters beside these ones
const regex = /[^a-zA-Z0-9-:,. ]/g 

const getAllFood = async (req, res) => {
    let {
        foodName,
        category,
        vendor,
        taste,
        minPrice,
        maxPrice,
        type,
        next_cursor,
    } = req.query;

    const queryObject = {};
    if (foodName) {
        queryObject.foodName = { $regex: `${foodName}`, $options: "i" };
    }

    if (category) {
        queryObject.category = category;
    }

    if (vendor) {
        const findVendor = await User.findOne({ username: vendor });
        if (!findVendor) {
            throw new CustomError.BadRequestError("This vendor does not exist");
        }

        queryObject.vendor = findVendor._id;
    }

    if (taste) {
        queryObject.taste = {
            $in: taste.split(","),
        };
    }

    if (minPrice) {
        queryObject.price = { $gte: Number(minPrice) };
    }

    if (maxPrice) {
        queryObject.price = { ...queryObject.price, $lte: Number(maxPrice) }; // use spread operator to NOT override the previous field
    }

    if (type) {
        queryObject.type = type;
    } else {
        // if meal type is not specified
        const now = new Date();
        const hours = now.getHours(); // get the hour of the day based on local time
        const type = hours < 11 ? "Breakfast" : hours < 16 ? "Lunch" : "Dinner"; // return the meal type based on the hour of the day
        queryObject.type = type;
    }

    if (next_cursor) {
        const [weightRating, price, createdAt, _id] = Buffer.from(
            next_cursor,
            "base64"
        )
            .toString("ascii")
            .split("_");

        queryObject.$or = [
            { weightRating: { $lt: weightRating } },
            { weightRating: weightRating, price: { $gt: price } },
            { price: price, createdAt: { $lt: createdAt } },
            { createdAt: createdAt, _id: { $lt: _id } },
        ];
    }

    const resultsLimitPerLoading = 4;
    let foods = Food.find(queryObject)
        .select(
            "foodName price vendor averageRating weightRating image taste location createdAt"
        )
        .populate({
            path: "vendor",
            select: "-_id username", // select username and not include _id
        });

    foods = foods.sort("-weightRating price -createdAt");
    foods = foods.limit(resultsLimitPerLoading);
    const results = await foods;

    const count = await Food.countDocuments(queryObject);
    const remainingResults = count - results.length;
    next_cursor = null;
    if (results.length !== count) {
        const lastResult = results[results.length - 1];
        next_cursor = Buffer.from(
            lastResult.weightRating +
                "_" +
                lastResult.price +
                "_" +
                lastResult.createdAt +
                "_" +
                lastResult._id
        ).toString("base64");
    }

    res.status(StatusCodes.OK).json({
        results,
        remainingResults,
        next_cursor,
    });
};

const getFood = async (req, res) => {
    const { id: foodId } = req.params;
    const food = await Food.findOne({ _id: foodId });

    if (!food) {
        throw new CustomError.NotFoundError(
            `Food with id ${foodId} does not exist`
        );
    }
    res.status(StatusCodes.OK).json({ food });
};

const createFood = async (req, res) => {
    const {
        body: {
            foodName,
            location,
            price,
            category,
            type,
            taste,
            prepareTime,
            image,
        },
        user: { userId },
    } = req;

    if (foodName.match(regex) || location.match(regex)) {
        throw new CustomError.BadRequestError(
            "This food name or location must not have strange characters"
        );
    }

    const duplicateFood = await Food.findOne({
        foodName: { $regex: `^${foodName}$`, $options: "i" }, // find duplicate food with case insensitive
        vendor: userId,
    });

    if (duplicateFood) {
        throw new CustomError.BadRequestError(
            "This food already exists in this vendor"
        );
    }

    const newFood = {
        foodName: validator.escape(foodName),
        location: validator.escape(location),
        price,
        category,
        type,
        taste,
        prepareTime,
        image,
        vendor: userId,
    };

    const food = await Food.create(newFood);
    res.status(StatusCodes.OK).json({ food });
};

const updateFood = async (req, res) => {
    const {
        params: { id: foodId },
        body: {
            foodName,
            location,
            price,
            category,
            type,
            taste,
            prepareTime,
            image,
        },
        user: { userId },
    } = req;

    if (foodName.match(regex) || location.match(regex)) {
        throw new CustomError.BadRequestError(
            "This food name or location must not have strange characters"
        );
    }

    const updateFood = {
        foodName: validator.escape(foodName),
        location: validator.escape(location),
        price,
        category,
        type,
        taste,
        prepareTime,
        image,
    };

    const food = await Food.findOneAndUpdate(
        { _id: foodId, vendor: userId },
        updateFood,
        {
            new: true, // always return the new updated object
            runValidators: true, // always validate the attributes of the object
            useFindAndModify: false, // not show warning message
        }
    );

    if (!food) {
        throw new CustomError.BadRequestError(
            `Food with id ${foodId} does not exist or this vendor does not own this food`
        );
    }
    res.status(StatusCodes.OK).json({ food });
};

const deleteFood = async (req, res) => {
    const {
        params: { id: foodId },
        user: { userId },
    } = req;

    const food = await Food.findOne({ _id: foodId, vendor: userId });

    if (!food) {
        throw new CustomError.BadRequestError(
            `Food with id ${foodId} does not exist or this vendor does not own this food`
        );
    }

    await food.remove();

    res.status(200).json({ msg: "Success! Food deleted" });
};

module.exports = {
    getAllFood,
    getFood,
    createFood,
    updateFood,
    deleteFood,
};
