const User = require("../models/User");

const recommedFoodsForStudent = async (studentId) => {
    const student = await User.findOne({ _id: studentId })
}

module.exports = recommedFoodsForStudent