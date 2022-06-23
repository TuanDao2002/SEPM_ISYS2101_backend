const express = require("express");
const router = express.Router();

const { getFood, getAllFood, createFood, updateFood, deleteFood } = require('../controllers/Food');

router.route('/')
    .get(getAllFood)
    .post(createFood);

router.route('/:id')
    .get(getFood)
    .patch(updateFood)
    .delete(deleteFood);

module.exports = router;