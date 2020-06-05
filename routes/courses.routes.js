const express = require('express');
const Course = require('../models/Course');

const {
  getAll,
  get,
  add,
  update,
  remove,
} = require('../controllers/courses.controller');
const authorize = require('../middlewares/auth');

const router = express.Router({ mergeParams: true });

const avdancedResults = require('../middlewares/advancedResults');

router
  .route('/')
  .get(
    avdancedResults(Course, { path: 'bootcamp', select: 'name description' }),
    getAll
  )
  .post(authorize('publisher', 'admin'), add);
router
  .route('/:id')
  .get(get)
  .put(authorize('publisher', 'admin'), update)
  .delete(authorize('publisher', 'admin'), remove);

module.exports = router;
