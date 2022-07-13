const createAllFoodProfiles = async (allFoods) => {
    let allProfiles = {};

    for (food of allFoods) {
        let profile = { "Noodle": 0, "Rice": 0, "Soup": 0, "Bread": 0, "Desert": 0, "Breakfast": 0, "Lunch": 0, "Dinner": 0, "Sweet": 0, "Sour": 0, "Bitter": 0, "Salty": 0 }

        const { category, type, taste } = food;
        profile[category] = 1;
        profile[type] = 1;

        for (eachTaste of taste) {
            profile[eachTaste] = 1;
        }

        

        allProfiles[[food._id]] = profile
    }

    return allProfiles;
}

module.exports = createAllFoodProfiles;