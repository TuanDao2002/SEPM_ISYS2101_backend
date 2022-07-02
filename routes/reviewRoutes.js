const express = require("express");
const router = express.Router();

const {
    createReview,
    getSingleFoodReviews,
    updateReview,
    deleteReview,
} = require("../controllers/reviewController");

const {
    authenticateUser,
    authorizePermissions,
} = require("../middleware/authentication");

router
    .route("/")
    .post([authenticateUser, authorizePermissions("student")], createReview);

router
    .route("/:id")
    .get(getSingleFoodReviews)
    .patch([authenticateUser, authorizePermissions("student")], updateReview)
    .delete([authenticateUser, authorizePermissions("student")], deleteReview);

module.exports = router;
