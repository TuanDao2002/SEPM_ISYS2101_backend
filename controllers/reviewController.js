
const { StatusCodes } = require("http-status-codes");
const Review = require("../models/Review");

const getAllReviews = async (req, res) => {
    const allReivews = await Review.findOne({})
    res.status(200).json({ allReivews });
};

const createReview = async (req, res) => {
    const review = await Review.create(req.body);
    res.status(200).json({ review });
};

const updateReview = async (req, res) => {
    const { _id: reviewId } = req.params;

    const review = await Review.findOneAndUpdate({ _id: reviewId }, req.body, {
        new: true, // always return the new updated object
        runValidators: true, // always validate the attributes of the object
        useFindAndModify: false, // not show warning message
    });

    if (!review) {
        // catch error here
    }
    res.status(200).json({ review });
};

const getReview = async (req, res) => {
    const { _id: reviewId } = req.params;
    const review = await Review.findOne({ _id: reviewId });

    if (!review) {
        // catch error here
    }
    res.status(200).json({ review });
};

const deleteReview = async (req, res) => {
    const { _id: reviewId } = req.params;
    const review = await Review.findByIdAndDelete({ _id: reviewId });

    if (!review) {
        // catch error here
    }
    res.status(200).send();
};

module.exports = {
    getAllReviews,
    getReview,
    createReview,
    updateReview,
    deleteReview,
};