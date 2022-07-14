const mongoose = require("mongoose");
const Food = require("../models/Food");

const intersection = (profile1, profile2) => {
    var setProfile1 = new Set(profile1);
    var setProfile2 = new Set(profile2);
    return [...setProfile1].filter(attr => setProfile2.has(attr));
}

const union = (profile1, profile2) => {
    return [...new Set([...profile1, ...profile2])];
}

// using Jaccard similarity
const calculateSimilarity = (attributesSet1, attributesSet2) => {
    const [name1, ...newAttributesSet1] = attributesSet1;
    const [name2, ...newAttributesSet2] = attributesSet2;

    const intersectionCount = intersection(newAttributesSet1, newAttributesSet2).length;
    const unionCount = union(newAttributesSet1, newAttributesSet2).length;
    if (name2.includes(name1)) {
        return (1 + intersectionCount) / (1 + unionCount)
    } else {
        return intersectionCount / (2 + unionCount)
    }
}

const findSimilar = async (food, allAttributeSets) => {
    const numOfSimilar = 3;
    const similarFoods = [];
    const foodAttributesSet = allAttributeSets[food._id]
    for (foodID of Object.keys(allAttributeSets)) {
        if (food._id.toString() !== foodID) {
            const otherFoodAttributesSet = allAttributeSets[foodID]
            similarFoods.push({
                id: mongoose.Types.ObjectId(foodID),
                similarity: calculateSimilarity(foodAttributesSet, otherFoodAttributesSet),
            })
        }
    }

    similarFoods.sort((a, b) => b.similarity - a.similarity); // descending sort by similarity
    food.similarOnes = similarFoods.map(food => food.id).slice(0, numOfSimilar);

    await food.save();
}

module.exports = findSimilar