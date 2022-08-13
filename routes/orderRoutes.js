const express = require("express");
const router = express.Router();

const {
    authenticateUser,
    authorizePermissions,
} = require("../middleware/authentication");

const {
    openFoodOrder,
    orderFood,
    getOrders,
    fulfillOrder,
    getSubscriptionToken,
    momoReturn,
} = require("../controllers/orderController");

router
    .route("/openFoodOrder")
    .post([authenticateUser, authorizePermissions("vendor")], openFoodOrder);

router
    .route("/orderFood")
    .post([authenticateUser, authorizePermissions("student")], orderFood);

router
    .route("/getOrders")
    .get(
        [authenticateUser, authorizePermissions("student", "vendor")],
        getOrders
    );

router
    .route("/fulfillOrder/:id")
    .patch([authenticateUser, authorizePermissions("vendor")], fulfillOrder);

router
    .route("/getSubscriptionToken")
    .get(
        [authenticateUser, authorizePermissions("vendor")],
        getSubscriptionToken
    );

router
    .route("/momoReturn")
    .get(momoReturn);

module.exports = router;
