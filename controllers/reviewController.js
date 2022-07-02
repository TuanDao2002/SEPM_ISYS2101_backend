const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const validator = require("validator");

const Review = require("../models/Review");
const Food = require("../models/Food");

const createReview = async (req, res) => {
    let { food: foodId, title, comment } = req.body;

    if (title.length > 100 || comment.length > 100) {
        throw new CustomError.NotFoundError(
            "Title or comment must have length less than 100 characters"
        );
    }

    // escape tags to prevent XSS
    req.body.title = validator.escape(title);
    req.body.comment = validator.escape(comment);

    const isValidFood = await Food.findOne({ _id: foodId });

    if (!isValidFood) {
        throw new CustomError.NotFoundError(`No food with id : ${foodId}`);
    }

    const alreadySubmitted = await Review.findOne({
        food: foodId,
        user: req.user.userId,
    });

    if (alreadySubmitted) {
        throw new CustomError.BadRequestError(
            "Already submitted review for this food"
        );
    }

    req.body.user = req.user.userId;

    const review = await Review.create(req.body);
    res.status(200).json({ review });
};

const getSingleFoodReviews = async (req, res) => {
    const { id: foodId } = req.params;

    const loadingCount =
        Number(req.query.loadingCount) > 0 ? Number(req.query.loadingCount) : 1;
    const resultsLimitPerLoading = 5;
    const skip = (loadingCount - 1) * resultsLimitPerLoading;

    try {
        await Review.find({ food: foodId })
            .populate({
                path: "user",
                select: "-_id username", // select username and not include _id
            })
            .sort("rating -createdAt")
            .skip(skip)
            .limit(resultsLimitPerLoading)
            .exec(function (err, reviews) {
                Review.countDocuments({ food: foodId }).exec(function (
                    err,
                    count
                ) {
                    if (err) throw err;
                    numOfResultsPerLoading = reviews.length;
                    resultsCount = count;
                    res.status(StatusCodes.OK).json({
                        reviews,
                        numOfResultsPerLoading,
                        resultsCount,
                    });
                });
            });
    } catch (err) {
        throw err;
    }
};

const updateReview = async (req, res) => {
    const {
        params: { id: reviewId },
        user: { userId },
    } = req;
    const { rating, title, comment } = req.body;

    const review = await Review.findOne({ _id: reviewId, user: userId });
    if (!review) {
        throw new CustomError.BadRequestError(
            `Review with id ${reviewId} does not exist or this user does not write this review`
        );
    }

    review.rating = rating;
    // escape tags to prevent XSS
    review.title = validator.escape(title);
    review.comment = validator.escape(comment);

    await review.save();
    res.status(200).json({ review });
};

const deleteReview = async (req, res) => {
    const {
        params: { id: reviewId },
        user: { userId },
    } = req;

    const review = await Review.findOne({ _id: reviewId, user: userId });
    if (!review) {
        throw new CustomError.BadRequestError(
            `Review with id ${reviewId} does not exist or this user does not write this review`
        );
    }

    await review.remove();
    res.status(StatusCodes.OK).json({ msg: "Success! Review removed!" });
};

module.exports = {
    createReview,
    getSingleFoodReviews,
    updateReview,
    deleteReview,
};
