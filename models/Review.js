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
			maxlength: 100,
		},

		comment: {
			type: String,
			required: [true, "Please provide the comment"],
			maxlength: 100,
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

	const averageRatingAllFood = await this.model("Food").aggregate({
		$group: {
			_id: null,
			averageRating: { $avg: "$averageRating" }
		}
	})

	try {
		await this.model("Food").findOneAndUpdate(
			{ _id: foodId },
			{
				averageRating: Math.ceil(result[0]?.averageRating || 0),
				numOfReviews: result[0]?.numOfReviews || 0,
			}
		);
	} catch (err) {
        throw err
	}
};

ReviewSchema.post("save", async function () {
	await this.constructor.calculateAverageRating(this.food);
});

ReviewSchema.post("remove", async function () {
	await this.constructor.calculateAverageRating(this.food);
});

module.exports = mongoose.model("Review", ReviewSchema);
