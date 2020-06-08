const express = require('express');
const Review = require('../models/Review');

const {
  getAll,
  get,
  create,
  update,
  remove,
} = require('../controllers/reviews.controller');

const authorize = require('../middlewares/auth');
const advancedResults = require('../middlewares/advancedResults');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(
    advancedResults(Review, {
      path: 'bootcamp user',
      select: 'name description email',
    }),
    getAll
  )
  .post(authorize('user', 'admin'), create);
router
  .route('/:id')
  .get(get)
  .put(authorize('user', 'admin'), update)
  .delete(authorize('user', 'admin'), remove);

module.exports = router;
