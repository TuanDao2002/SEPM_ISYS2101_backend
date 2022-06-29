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
    uploadFoodImage
} = require("../controllers/uploadsController")

const {
    authenticateUser,
    authorizePermissions,
} = require("../middleware/authentication");

router
    .route("/")
    .get(getAllFood)
    .post([authenticateUser, authorizePermissions("vendor")], createFood);
    
router.route("/upload-image").post([authenticateUser, authorizePermissions("vendor")], uploadFoodImage);

router
    .route("/:id")
    .get(getFood)
    .patch([authenticateUser, authorizePermissions("vendor")], updateFood)
    .delete([authenticateUser, authorizePermissions("vendor")], deleteFood);

module.exports = router;
