const mongoose = require("mongoose");
const Food = require("../models/Food");

const createProfiles = async (allFoods) => {
    let allProfiles = {};

    for (food of allFoods) {
        let attributesSet = []
        const { foodName, category, type, taste } = food;
        attributesSet = [foodName, category, type, taste].flat();
        allProfiles[[food._id]] = attributesSet
    }

    return allProfiles;
}

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

const findSimilar = (food, allProfiles) => {
    const numOfSimilar = 3;
    const similarFoods = [];
        const foodAttributesSet = allProfiles[food._id]
        for (profileID of Object.keys(allProfiles)) {
            if (food._id.toString() !== profileID) {
                const otherFoodAttributesSet = allProfiles[profileID]
                similarFoods.push({
                    id: mongoose.Types.ObjectId(profileID),
                    similarity: calculateSimilarity(foodAttributesSet, otherFoodAttributesSet),
                    set: otherFoodAttributesSet
                })
            }
        }

        similarFoods.sort((a, b) => b.similarity - a.similarity); // descending sort by similarity
        food.similarOnes = similarFoods.map(food => food.id).slice(0, numOfSimilar);
}

const setSimilar = async () => {
    const allFoods = await Food.find();
    const allProfiles = await createProfiles(allFoods)

    for (food of allFoods) {
        findSimilar(food, allProfiles);
        await food.save();
    }
}

module.exports = {
    setSimilar,
}