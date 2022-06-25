const express = require("express");
const router = express.Router();

const {
    getReview,
    getAllReviews,
    createReview,
    updateReview,
    deleteReview,
} = require("../controllers/reviewControllers");


router
    .route("/")
    .get(getAllReviews)
    .post(reateReview);

router
    .route("/:id")
    .get(getReview)
    .patch(updateReview)
    .delete(deleteReview);

module.exports = router;
