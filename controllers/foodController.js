const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

const Food = require("../models/Food");
const User = require("../models/User");

const getAllFood = async (req, res) => {
    const start = new Date()
    let { category, vendor, taste, minPrice, maxPrice, type, next_cursor } =
        req.query;
    const queryObject = {};

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
        const [price, createdAt] = Buffer.from(next_cursor, "base64")
            .toString("ascii")
            .split("_");

        queryObject.$or = [
            { price: { $gt: price } },
            { price: price, createdAt: { $lt: createdAt } },
        ];
    }

    // const loadingCount = Number(req.query.loadingCount) > 0 ? Number(req.query.loadingCount) : 1;
    const resultsLimitPerLoading = 2;
    // const skip = (loadingCount - 1) * resultsLimitPerLoading;

    try {
        await Food.find(queryObject)
            .select("foodName price vendor image taste location createdAt")
            .populate({
                path: "vendor",
                select: "-_id username", // select username and not include _id
            })
            .sort("price -createdAt")
            // .skip(skip)
            .limit(resultsLimitPerLoading)
            .exec(function (err, foods) {
                if (err) throw err;
                Food.countDocuments(queryObject).exec(function (err, count) {
                    if (err) throw err;
                    let remainingResults = count - foods.length;

                    let next_cursor = null;
                    if (foods.length !== count) {
                        next_cursor = Buffer.from(foods[foods.length - 1].price + "_" + foods[foods.length - 1].createdAt).toString("base64");
                    }

                    const end = new Date();

                    res.status(StatusCodes.OK).json({
                        foods,
                        remainingResults,
                        next_cursor,
                        timetaken: end - start
                    });
                });
            });
    } catch (err) {
        throw err;
    }
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
        body: { foodName },
        user: { userId },
    } = req;

    const duplicateFood = await Food.findOne({
        foodName: { $regex: `^${foodName}$`, $options: "i" }, // find duplicate food with case insensitive
        vendor: userId,
    });

    if (duplicateFood) {
        throw new CustomError.BadRequestError(
            "This food already exists in this vendor"
        );
    }

    req.body.vendor = userId;

    const food = await Food.create(req.body);
    res.status(StatusCodes.OK).json({ food });
};

const updateFood = async (req, res) => {
    const {
        params: { id: foodId },
        user: { userId },
    } = req;

    const food = await Food.findOneAndUpdate(
        { _id: foodId, vendor: userId },
        req.body,
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
