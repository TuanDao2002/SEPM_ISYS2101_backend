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

module.exports = createProfiles