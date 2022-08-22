require("dotenv").config();

const connectDB = require("./db/connect");
const Food = require("./models/Food");
const Review = require("./models/Review");

const jsonProducts = require("./food.json");
const jsonReviews = require("./review.json");

const { createAllAttributeSets, findSimilar } = require("./computation/index");

const start = async () => {
	try {
		await connectDB(process.env.MONGO_URI);
		// await Food.deleteMany();
		// await Food.create(jsonProducts);

		// const allFoods = await Food.find();
		// const allAttributeSets = await createAllAttributeSets(allFoods);
		// for (eachFood of allFoods) {
		// 	findSimilar(eachFood, allAttributeSets);
		// }

		await Review.deleteMany();
		await Review.create(jsonReviews);

		console.log("Success!!!!");
		process.exit(0);
	} catch (error) {
		console.log(error);
		process.exit(1);
	}
};

start();
