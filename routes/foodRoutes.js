const express = require("express");
const router = express.Router();

const {
    getFood,
    getAllFood,
    createFood,
    updateFood,
    deleteFood,
} = require("../controllers/foodController");

const {
    authenticateUser,
    authorizePermissions,
} = require("../middleware/authentication");

router
    .route("/")
    .get(getAllFood)
    .post([authenticateUser, authorizePermissions("vendor")], createFood);

router
    .route("/:id")
    .get(getFood)
    .patch([authenticateUser, authorizePermissions("vendor")], updateFood)
    .delete([authenticateUser, authorizePermissions("vendor")], deleteFood);

module.exports = router;
