const createAllAttributeSets = async (allFoods) => {
    let allAttributeSets = {};

    for (food of allFoods) {
        let attributesSet = []
        const { foodName, category, type, taste } = food;
        attributesSet = [foodName, category, type, taste].flat();
        allAttributeSets[[food._id]] = attributesSet
    }

    return allAttributeSets;
}

module.exports = createAllAttributeSets