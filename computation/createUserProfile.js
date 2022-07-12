const User = require("../models/User");

const createUserProfile = async (rating, foodId, userId) => {
	if (rating >= 4) {
		await User.updateOne({ _id: userId }, { $push: { foodsLiked: foodId } });
	} else if (rating <= 2) {
		await User.updateOne({ _id: userId }, { $push: { foodsNotLiked: foodId } });
	}
};

module.exports = createUserProfile;
