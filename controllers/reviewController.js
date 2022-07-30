const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

const Review = require("../models/Review");
const Food = require("../models/Food");

// regex check if there are any tag
const regex = /<.*>/g;

const createReview = async (req, res) => {
	let { food: foodId, rating, title, comment } = req.body;

	if (title.match(regex) || comment.match(regex)) {
		throw new CustomError.BadRequestError(
			"This title or comment must not have strange characters"
		);
	}

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

	// escape tags to prevent XSS
	const newReview = {
		rating,
		title,
		comment,
		user: req.user.userId,
		food: foodId,
	};

	const review = await Review.create(newReview);
	res.status(200).json({ review });
};

const getSingleFoodReviews = async (req, res) => {
	let {
		params: { id: foodId },
		query: { next_cursor },
	} = req;
	const queryObject = { food: foodId };

	const resultsLimitPerLoading = 4;
	if (next_cursor) {
		const [rating, createdAt] = Buffer.from(next_cursor, "base64")
			.toString("ascii")
			.split("_");

		queryObject.$or = [
			{ rating: { $lt: rating } },
			{ rating: rating, createdAt: { $lt: createdAt } }
		];
	}

	let reviews = Review.find(queryObject).populate({
		path: "user",
		select: "-_id username", // select username and not include _id
	});

	reviews = reviews.sort("-rating -createdAt");
	reviews = reviews.limit(resultsLimitPerLoading);
	const results = await reviews;

	const count = await Review.countDocuments(queryObject);
	const remainingResults = count - results.length;
	next_cursor = null;
	if (results.length !== count) {
		const lastReview = results[results.length - 1];
		next_cursor = Buffer.from(
			lastReview.rating + "_" + lastReview.createdAt.toISOString()
		).toString("base64");
	}

	res.status(StatusCodes.OK).json({
		results,
		remainingResults,
		next_cursor,
	});
};

const updateReview = async (req, res) => {
	const {
		params: { id: reviewId },
		user: { userId },
	} = req;
	const { rating, title, comment } = req.body;

	if (title.match(regex) || comment.match(regex)) {
		throw new CustomError.BadRequestError(
			"This title or comment must not have strange characters"
		);
	}

	const review = await Review.findOne({ _id: reviewId, user: userId });
	if (!review) {
		throw new CustomError.BadRequestError(
			`Review with id ${reviewId} does not exist or this user does not write this review`
		);
	}

	review.rating = rating;
	review.title = title;
	review.comment = comment;

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
