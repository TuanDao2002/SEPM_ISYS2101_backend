const mongoose = require("mongoose");
const User = require("../models/User");
const Food = require("../models/Food");

const recommedFoodsForStudent = async (studentId, allProfiles) => {
    // recommend foods for a student with content-based filtering
    const numOfRecommendFoods = 5;

    const student = await User.findOne({ _id: studentId });
    const { foodsLiked, foodsNotLiked } = student;
    if (foodsLiked.length === 0 && foodsNotLiked.length === 0) {
        const highestRatingFood = await Food.find()
            .sort("-weightRating price -createdAt -_id")
            .limit(numOfRecommendFoods);

        student.recommendFoods = highestRatingFood.map((food) => food.id);
        await student.save();
        return;
    }

    const userProfile = {
        Noodle: 0,
        Rice: 0,
        Soup: 0,
        Bread: 0,
        Desert: 0,
        Breakfast: 0,
        Lunch: 0,
        Dinner: 0,
        Sweet: 0,
        Sour: 0,
        Bitter: 0,
        Salty: 0,
    };

    const idf = {
        Noodle: 0,
        Rice: 0,
        Soup: 0,
        Bread: 0,
        Desert: 0,
        Breakfast: 0,
        Lunch: 0,
        Dinner: 0,
        Sweet: 0,
        Sour: 0,
        Bitter: 0,
        Salty: 0,
    };

    const totalNumOfDoc = Object.keys(allProfiles).length;
    for (attribute of Object.keys(userProfile)) {
        let numOfDocWithAttribute = 0;
        for (foodId of Object.keys(allProfiles)) {
            if (allProfiles[[foodId]][attribute] !== 0) {
                numOfDocWithAttribute++;
            }
        }

        if (numOfDocWithAttribute === 0) {
            idf[[attribute]] = 0;
        } else {
            idf[[attribute]] = Math.log10(
                totalNumOfDoc / numOfDocWithAttribute
            );
        }
    }

    for (attribute of Object.keys(userProfile)) {
        for (foodId of foodsLiked) {
            userProfile[[attribute]] += allProfiles[foodId][[attribute]];
        }

        for (foodId of foodsNotLiked) {
            userProfile[[attribute]] -= allProfiles[foodId][[attribute]];
        }
    }

    let allPredictions = [];
    for (foodId of Object.keys(allProfiles)) {
        let predictionPossibility = 0;
        for (attribute of Object.keys(userProfile)) {
            predictionPossibility +=
                userProfile[[attribute]] *
                allProfiles[foodId][[attribute]] *
                idf[[attribute]];
        }

        allPredictions.push({
            id: mongoose.Types.ObjectId(foodId),
            predictionPossibility,
        });
    }

    allPredictions.sort(
        (a, b) => b.predictionPossibility - a.predictionPossibility
    ); // descending sort by prediction possibility
    student.recommendFoods = allPredictions
        .map((food) => food.id)
        .slice(0, numOfRecommendFoods);
    await student.save();
};

module.exports = recommedFoodsForStudent;
