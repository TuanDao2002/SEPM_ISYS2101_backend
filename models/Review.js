const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
	{
		rating: {
			type: Number,
			min: 1,
			max: 5,
			required: [true, "Please provide the rating"],
		},

		title: {
			type: String,
			trim: true,
			required: [true, "Please provide the title"],
			maxlength: [100, "Length must be less than 100"],
		},

		comment: {
			type: String,
			required: [true, "Please provide the comment"],
			minlength: [1, "Length must be greater than 1"],
			maxlength: [100, "Length must be less than 100"],
		},

		user: {
			type: mongoose.Schema.ObjectId,
			ref: "User",
			required: true,
		},

		food: {
			type: mongoose.Schema.ObjectId,
			ref: "Food",
			required: true,
		},
	},
	{ timestamps: true }
);

ReviewSchema.index({ food: 1, user: 1 }, { unique: true });

ReviewSchema.statics.calculateAverageRating = async function (foodId) {
	const result = await this.aggregate([
		{ $match: { food: foodId } },
		{
			$group: {
				_id: null,
				averageRating: { $avg: "$rating" },
				numOfReviews: { $sum: 1 },
			},
		},
	]);

	const averageRating = result[0]?.averageRating || 0;
	const numOfReviews = result[0]?.numOfReviews || 0;

	const updateFood = await this.model("Food").findOne({ _id: foodId });
	updateFood.averageRating = averageRating;
	updateFood.numOfReviews = numOfReviews;

	await updateFood.save();

	const resultsFromAllFood = await this.model("Food").aggregate([
		{
			$group: {
				_id: null,
				averageRating: { $avg: "$rating" },
			},
		},
	]);

	const averageRatingAllFood = resultsFromAllFood[0]?.averageRating || 0;
	const acceptedNumOfReviews = 100;

	const allFoods = await this.model("Food").find();

	for (food of allFoods) {
		// IMDB rating formula
		const weightRating =
			(food.averageRating * food.numOfReviews +
				averageRatingAllFood * acceptedNumOfReviews) /
			(food.numOfReviews + acceptedNumOfReviews);

		food.weightRating = weightRating;
		await food.save();
	}
};

ReviewSchema.post("save", async function () {
	if (this.rating >= 4) {
		await this.model("User").updateOne(
			{ _id: userId },
			{ $addToSet: { foodsLiked: foodId } }
		);
	} else if (this.rating <= 2) {
		await this.model("User").updateOne(
			{ _id: userId },
			{ $addToSet: { foodsNotLiked: foodId } }
		);
	}
	await this.constructor.calculateAverageRating(this.food);
});

ReviewSchema.post("remove", async function () {
	const user = await this.model("User").findOne({ _id: this.user });
	const { foodsLiked, foodsNotLiked } = user;
	if (foodsLiked.includes(this.food)) {
		user.foodsLiked = foodsLiked.filter((foodId) => foodId != this.food);
	} else if (foodsNotLiked.includes(this.food)) {
		user.foodsNotLiked = foodsNotLiked.filter((foodId) => foodId != this.food);
	}

	await user.save();

	await this.constructor.calculateAverageRating(this.food);
});

module.exports = mongoose.model("Review", ReviewSchema);
