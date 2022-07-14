const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

const Food = require("../models/Food");
const User = require("../models/User");

const { createAllAttributeSets, findSimilar } = require("../computation/index");

// regex check if there are any tag
const regex = /<.*>/g;

const createAllFoodProfiles = require("../computation/createAllFoodProfiles");
const recommedFoodsForStudent = require("../computation/recommendFoodsForStudent");

const getAllFood = async (req, res) => {
	let {
		foodName,
		category,
		vendor,
		taste,
		minPrice,
		maxPrice,
		type,
		next_cursor,
	} = req.query;

	const queryObject = {};
	if (foodName) {
		queryObject.foodName = { $regex: `${foodName}`, $options: "i" };
	}

	if (category) {
		queryObject.category = category;
	}

	if (vendor) {
		const findVendor = await User.findOne({ username: vendor });
		if (!findVendor) {
			throw new CustomError.BadRequestError("This vendor does not exist");
		}

		queryObject.vendor = findVendor._id;
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

	if (type) {
		queryObject.type = type;
	} else {
		// if meal type is not specified
		const now = new Date();
		const hours = now.getHours(); // get the hour of the day based on local time
		const type = hours < 11 ? "Breakfast" : hours < 16 ? "Lunch" : "Dinner"; // return the meal type based on the hour of the day
		queryObject.type = type;
	}

	if (next_cursor) {
		const [weightRating, price, createdAt, _id] = Buffer.from(
			next_cursor,
			"base64"
		)
			.toString("ascii")
			.split("_");

		queryObject.$or = [
			{ weightRating: { $lt: weightRating } },
			{ weightRating: weightRating, price: { $gt: price } },
			{ price: price, createdAt: { $lt: createdAt } },
			{ createdAt: createdAt, _id: { $lt: _id } },
		];
	}

	const resultsLimitPerLoading = 5;
	let foods = Food.find(queryObject)
		.select(
			"foodName price vendor averageRating weightRating image taste location createdAt"
		)
		.populate({
			path: "vendor",
			select: "-_id username", // select username and not include _id
		});
	foods = foods.sort("-weightRating price -createdAt");
	foods = foods.limit(resultsLimitPerLoading);
	const results = await foods;

	const count = await Food.countDocuments(queryObject);
	const remainingResults = count - results.length;
	next_cursor = null;
	if (results.length !== count) {
		const lastResult = results[results.length - 1];
		next_cursor = Buffer.from(
			lastResult.weightRating +
				"_" +
				lastResult.price +
				"_" +
				lastResult.createdAt +
				"_" +
				lastResult._id
		).toString("base64");
	}

	res.status(StatusCodes.OK).json({
		results,
		remainingResults,
		next_cursor,
	});
};

const getFood = async (req, res) => {
	const { id: foodId } = req.params;
	const food = await Food.findOne({ _id: foodId })
		.populate({
			path: "vendor",
			select: "-_id username", // select username and not include _id
		})
		.populate({
			path: "similarOnes",
			select:
				"foodName price vendor averageRating weightRating image taste location createdAt",
			populate: {
				path: "vendor",
				select: "-_id username", // select username and not include _id
			},
		});

	if (!food) {
		throw new CustomError.NotFoundError(
			`Food with id ${foodId} does not exist`
		);
	}
	res.status(StatusCodes.OK).json({ food });
};

const createFood = async (req, res) => {
	const {
		body: {
			foodName,
			location,
			price,
			category,
			type,
			taste,
			prepareTime,
			image,
		},
		user: { userId },
	} = req;

	if (foodName.match(regex) || location.match(regex)) {
		throw new CustomError.BadRequestError(
			"This food name or location must not have strange characters"
		);
	}

	const duplicateFood = await Food.findOne({
		foodName: { $regex: `^${foodName}$`, $options: "i" }, // find duplicate food with case insensitive
		vendor: userId,
	});

	if (duplicateFood) {
		throw new CustomError.BadRequestError(
			"This food already exists in this vendor"
		);
	}

	const newFood = {
		foodName,
		location,
		price,
		category,
		type,
		taste,
		prepareTime,
		image,
		vendor: userId,
	};

	const food = await Food.create(newFood);

	const allFoods = await Food.find();
	const allAttributeSets = await createAllAttributeSets(allFoods);
	for (eachFood of allFoods) {
		findSimilar(eachFood, allAttributeSets);
	}

	res.status(StatusCodes.OK).json({ food });
};

const updateFood = async (req, res) => {
	const {
		params: { id: foodId },
		body: {
			foodName,
			location,
			price,
			category,
			type,
			taste,
			prepareTime,
			image,
		},
		user: { userId },
	} = req;

	if (foodName.match(regex) || location.match(regex)) {
		throw new CustomError.BadRequestError(
			"This food name or location must not have strange characters"
		);
	}

	const duplicateFood = await Food.findOne({
		foodName: { $regex: `^${foodName}$`, $options: "i" }, // find duplicate food with case insensitive
		vendor: userId,
	});

	if (duplicateFood && duplicateFood._id != foodId) {
		throw new CustomError.BadRequestError(
			"This food already exists in this vendor"
		);
	}

	const food = await Food.findOne({ _id: foodId, vendor: userId });
	if (!food) {
		throw new CustomError.BadRequestError(
			`Food with id ${foodId} does not exist or this vendor does not own this food`
		);
	}

	food.foodName = foodName;
	food.location = location;
	food.price = price;
	food.category = category;
	food.type = type;
	food.taste = taste;
	food.prepareTime = prepareTime;
	food.image = image;
	await food.save();
	res.status(StatusCodes.OK).json({ food });

	const allFoods = await Food.find();
	const allAttributeSets = await createAllAttributeSets(allFoods);
	for (eachFood of allFoods) {
		findSimilar(eachFood, allAttributeSets);
	}
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

	const allFoods = await Food.find();
	const allAttributeSets = await createAllAttributeSets(allFoods);
	for (eachFood of allFoods) {
		findSimilar(eachFood, allAttributeSets);
	}
};

const recommendFoods = async (req, res) => {
	const studentID = req.user.userId;
	const allFoods = await Food.find();
	const profiles = await createAllFoodProfiles(allFoods);
	const userProfile = await recommedFoodsForStudent(studentID, profiles);

	res.status(200).json({ userProfile });
};

module.exports = {
	getAllFood,
	getFood,
	createFood,
	updateFood,
	deleteFood,
	recommendFoods,
};
