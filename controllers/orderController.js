const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

const Order = require("../models/Order");
const Food = require("../models/Food");
const User = require("../models/User");

const openFoodOrder = async (req, res) => {
    const {
        user: { userId },
    } = req;
};

module.exports = { openFoodOrder };
