const express = require('express');
const Course = require('../models/Course');

const {
  getAll,
  get,
  create,
  update,
  remove,
} = require('../controllers/courses.controller');

const authorize = require('../middlewares/auth');
const avdancedResults = require('../middlewares/advancedResults');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(
    avdancedResults(Course, { path: 'bootcamp', select: 'name description' }),
    getAll
  )
  .post(authorize('publisher', 'admin'), create);
router
  .route('/:id')
  .get(get)
  .put(authorize('publisher', 'admin'), update)
  .delete(authorize('publisher', 'admin'), remove);

module.exports = router;
