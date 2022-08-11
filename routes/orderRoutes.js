const express = require("express");
const router = express.Router();

const {
    authenticateUser,
    authorizePermissions,
} = require("../middleware/authentication");

const { openFoodOrder } = require("../controllers/orderController");

router.route("/openFoodOrder").post()
