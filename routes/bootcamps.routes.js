const express = require('express');
const {
  getAll,
  get,
  create,
  update,
  remove,
  getByDistance,
  uploadPhoto,
} = require('../controllers/bootcamps.controller');
const advancedResults = require('../middlewares/advancedResults');
const authorize = require('../middlewares/auth');

const Bootcamp = require('../models/Bootcamp');

// Include other resource routers
const courseRouter = require('./courses.routes');

const router = express.Router();

// re-route into other resourse router
router.use('/:bootcampId/courses', courseRouter);

router
  .route('/')
  .get(
    advancedResults(Bootcamp, {
      path: 'courses user',
      select: 'title name email',
    }),
    getAll
  )
  .post(authorize('publisher', 'admin'), create);
router
  .route('/:id')
  .get(get)
  .put(authorize('publisher', 'admin'), update)
  .delete(authorize('publisher', 'admin'), remove);
router.route('/radius/:zipcode/:distance').get(getByDistance);
router.route('/:id/photo').put(authorize('publisher'), uploadPhoto);

module.exports = router;
