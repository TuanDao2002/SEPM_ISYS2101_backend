const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

const Food = require("../models/Food");

const getAllFood = async (req, res) => {
    const food = await Food.find().populate({
        path: "vendor",
        select: "-_id username", // select username and not include _id
    });
    res.status(StatusCodes.OK).json({ food });
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
        foodName: { $regex: foodName, $options: "i" }, // find duplicate food with case insensitive
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
