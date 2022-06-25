const Food = require("../models/Food");
const { StatusCodes } = require("http-status-codes");

const getAllFood = async (req, res) => {
    const food = await Food.find();
    res.status(200).json({ food });
};

const createFood = async (req, res) => {
    const food = await Food.create(req.body);
    res.status(200).json({ food });
};

const updateFood = async (req, res) => {
    const { _id: foodId } = req.params;

    const food = await Food.findOneAndUpdate({ _id: foodId }, req.body, {
        new: true, // always return the new updated object
        runValidators: true, // always validate the attributes of the object
        useFindAndModify: false, // not show warning message
    });

    if (!food) {
        // catch error here
    }
    res.status(200).json({ food });
};

const getFood = async (req, res) => {
    const { _id: foodId } = req.params;
    const food = await Food.findOne({ _id: foodId });

    if (!food) {
        // catch error here
    }
    res.status(200).json({ food });
};

const deleteFood = async (req, res) => {
    const { _id: foodId } = req.params;
    const food = await Food.findByIdAndDelete({ _id: foodId });

    if (!food) {
        // catch error here
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
