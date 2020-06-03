const express = require('express');
const Course = require('../models/Course');

const {
  getAll,
  get,
  add,
  update,
  remove,
} = require('../controllers/courses.controller');

const router = express.Router({ mergeParams: true });

const avdancedResults = require('../middlewares/advancedResults');

router
  .route('/')
  .get(
    avdancedResults(Course, { path: 'bootcamp', select: 'name description' }),
    getAll
  )
  .post(add);
router.route('/:id').get(get).put(update).delete(remove);

module.exports = router;
