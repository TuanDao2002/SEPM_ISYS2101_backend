const Food = require("../models/Food");

const createProfiles = async (allFoods) => {
    let allProfiles = {};

    for (food of allFoods) {
        let attributesSet = []
        const { foodName, category, type, taste } = food;
        attributesSet = [foodName.split(" "), category, type, taste].flat();
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

const calculateSimilarity = (attributesSet1, attributesSet2) => {
    return intersection(attributesSet1, attributesSet2).length / union(attributesSet1, attributesSet2).length
}

const findSimilar = async () => {
    const allFoods = await Food.find();
    const allProfiles = await createProfiles(allFoods)

    /*
    const profile1 = allProfiles[0]
    for (let i = 1; i < allProfiles.length; i++) {
        console.log(profile1.id + " and " + allProfiles[i].id)
        console.log(profile1)
        console.log(allProfiles[i])
        console.log(intersection(profile1.attributesSet, allProfiles[i].attributesSet))
        console.log(union(profile1.attributesSet, allProfiles[i].attributesSet))
    }
    */

    for (food of allFoods) {
        const similarFoods = [];
        const foodAttributesSet = allProfiles[food._id]
        for (profileID of Object.keys(allProfiles)) {
            if (food._id.toString() !== profileID) {
                const otherFoodAttributesSet = allProfiles[profileID]
                // console.log(otherFoodAttributesSet)
                similarFoods.push({
                    id: profileID,
                    similarity: calculateSimilarity(foodAttributesSet, otherFoodAttributesSet)
                })
            }
        }

        console.log(similarFoods)
    }
}

module.exports = {
    findSimilar,
}