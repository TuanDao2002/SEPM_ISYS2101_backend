const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

const Food = require("../models/Food");

const getAllFood = async (req, res) => {
    const food = await Food.find().populate({
        path: "vendor",
        select: "username",
    });
    res.status(StatusCodes.OK).json({ food });
};

const createFood = async (req, res) => {
    const {
        foodName,
        user: { userId },
    } = req.body;

    const duplicateFood = await Food.find({ foodName, vendor: userId });
    if (duplicateFood) {
        throw new CustomError.BadRequestError(
            "This food already exists in this vendor"
        );
    }

    const food = await Food.create(req.body);
    res.status(StatusCodes.OK).json({ food });
};

const updateFood = async (req, res) => {
    const { _id: foodId } = req.params;

    const food = await Food.findOneAndUpdate({ _id: foodId }, req.body, {
        new: true, // always return the new updated object
        runValidators: true, // always validate the attributes of the object
        useFindAndModify: false, // not show warning message
    });

    if (!food) {
        throw new CustomError.BadRequestError(
            `Food with id ${_id} does not exist`
        );
    }
    res.status(StatusCodes.OK).json({ food });
};

const getFood = async (req, res) => {
    const { _id: foodId } = req.params;
    const food = await Food.findOne({ _id: foodId });

    if (!food) {
        throw new CustomError.BadRequestError(
            `Food with id ${_id} does not exist`
        );
    }
    res.status(StatusCodes.OK).json({ food });
};

const deleteFood = async (req, res) => {
    const { _id: foodId } = req.params;
    const food = await Food.findByIdAndDelete({ _id: foodId });

    if (!food) {
        throw new CustomError.BadRequestError(
            `Food with id ${_id} does not exist`
        );
    }
    res.status(200).send();
};

module.exports = {
    getAllFood,
    getFood,
    createFood,
    updateFood,
    deleteFood,
};
