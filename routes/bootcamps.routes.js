const express = require('express');

const { getAll, get, create, update, remove, getByDistance } = require('../controllers/bootcamps.controller');
const advancedResults = require('../middlewares/advancedResults');
const Bootcamp = require('../models/Bootcamp');

const router = express.Router();

router.route('/')
    .get(advancedResults(Bootcamp), getAll)
    .post(create);

router.route('/:id')
    .get(get)
    .put(update)
    .delete(remove);

router.route('/radius/:zipcode/:distance').get(getByDistance);

module.exports = router;