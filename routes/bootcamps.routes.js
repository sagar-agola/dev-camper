const express = require('express');
const { getAll, get, create, update, remove } = require('../controllers/bootcamps.controller');

const router = express.Router();

router.route('/')
    .get(getAll)
    .post(create);

router.route('/:id')
    .get(get)
    .put(update)
    .delete(remove);

module.exports = router;