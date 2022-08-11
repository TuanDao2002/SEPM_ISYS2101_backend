const express = require("express");
const router = express.Router();

const {
    authenticateUser,
    authorizePermissions,
} = require("../middleware/authentication");

const { openFoodOrder, orderFood } = require("../controllers/orderController");

router
    .route("/openFoodOrder")
    .post([authenticateUser, authorizePermissions("vendor")], openFoodOrder);

router
    .route("/orderFood")
    .post([authenticateUser, authorizePermissions("student")], orderFood);

module.exports = router;
