const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

const Food = require("../models/Food");
const User = require("../models/User");

const {
    createAllAttributeSets,
    findSimilar,
    createAllFoodProfiles,
    recommedFoodsForStudent,
} = require("../computation/index");

// regex check if there are any tag
const regex = /<.*>/g;

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
        if (
            !["Noodle", "Rice", "Soup", "Bread", "Dessert"].includes(category)
        ) {
            throw new CustomError.BadRequestError(
                "This category does not exist"
            );
        }
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
        for (t of taste.split(",")) {
            if (!["Sweet", "Sour", "Bitter", "Salty"].includes(t)) {
                throw new CustomError.BadRequestError("A taste does not exist");
            }
        }
        queryObject.taste = {
            $in: taste.split(","),
        };
    }

    if (minPrice) {
        if (isNaN(minPrice)) {
            throw new CustomError.BadRequestError("Min price is not a number");
        }
        queryObject.price = { $gte: Number(minPrice) };
    }

    if (maxPrice) {
        if (isNaN(maxPrice)) {
            throw new CustomError.BadRequestError("Max price is not a number");
        }
        queryObject.price = { ...queryObject.price, $lte: Number(maxPrice) }; // use spread operator to NOT override the previous field
    }

    if (type) {
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
            { price: price, createdAt: { $lte: createdAt }, _id: { $lt: _id } },
        ];
    }

    const resultsLimitPerLoading = 4;
    let foods = Food.find(queryObject)
        .select(
            "foodName price vendor location averageRating weightRating image createdAt"
        )
        .populate({
            path: "vendor",
            select: "-_id username", // select username and not include _id
        });
    foods = foods.sort("-weightRating price -createdAt -_id");
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
                lastResult.createdAt.toISOString() +
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
            select: "foodName price vendor averageRating weightRating image createdAt",
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
            foodDescription,
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
        foodDescription,
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
    res.status(StatusCodes.OK).json({ food });

    const allFoods = await Food.find();
    const allAttributeSets = await createAllAttributeSets(allFoods);
    for (eachFood of allFoods) {
        findSimilar(eachFood, allAttributeSets);
    }

    const profiles = await createAllFoodProfiles(allFoods);
    const allStudents = await User.find({ role: "student" });
    for (eachStudent of allStudents) {
        recommedFoodsForStudent(eachStudent._id, profiles);
    }
};

const updateFood = async (req, res) => {
    const {
        params: { id: foodId },
        body: {
            foodName,
            foodDescription,
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
    food.foodDescription = foodDescription;
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

    const profiles = await createAllFoodProfiles(allFoods);
    const allStudents = await User.find({ role: "student" });
    for (eachStudent of allStudents) {
        recommedFoodsForStudent(eachStudent._id, profiles);
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

    const profiles = await createAllFoodProfiles(allFoods);
    const allStudents = await User.find({ role: "student" });
    for (eachStudent of allStudents) {
        recommedFoodsForStudent(eachStudent._id, profiles);
    }
};

const recommendFoods = async (req, res) => {
    const user = await User.findOne({ _id: req.user.userId })
        .select("recommendFoods")
        .populate({
            path: "recommendFoods",
            select: "foodName price vendor averageRating weightRating image createdAt",
        });
    res.status(200).json({ user });
};

module.exports = {
    getAllFood,
    getFood,
    createFood,
    updateFood,
    deleteFood,
    recommendFoods,
};
