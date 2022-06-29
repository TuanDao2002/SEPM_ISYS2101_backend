const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

const Food = require("../models/Food");
const User = require("../models/User");

const getAllFood = async (req, res) => {
    let { category, vendor, taste, minPrice, maxPrice } = req.query;
    const queryObject = {};

    if (category) {
        queryObject.category = category;
    }

    if (vendor) {
        const vendorId = await User.findOne({ username: vendor });
        if (!vendorId) {
            throw new CustomError.BadRequestError("This vendor does not exist");
        }

        queryObject.vendor = vendorId;
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

    const loadingCount =
        Number(req.query.loadingCount) > 0 ? Number(req.query.loadingCount) : 1;
    const resultsLimitPerLoading = 5;
    const skip = (loadingCount - 1) * resultsLimitPerLoading;

    let resultsCount = 0;
    let numOfResultsPerLoading = 0;
    try {
        await Food.find(queryObject)
            .select("foodName price vendor image")
            .populate({
                path: "vendor",
                select: "-_id username", // select username and not include _id
            })
            .sort("price -createdAt")
            .skip(skip)
            .limit(resultsLimitPerLoading)
            .exec(function (err, foods) {
                Food.countDocuments(queryObject).exec(function (err, count) {
                    if (err) throw err;
                    numOfResultsPerLoading = foods.length;
                    resultsCount = count;
                    res.status(StatusCodes.OK).json({
                        foods,
                        numOfResultsPerLoading,
                        resultsCount,
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
