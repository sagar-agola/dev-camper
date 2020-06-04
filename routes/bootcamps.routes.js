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

const Bootcamp = require('../models/Bootcamp');

// Include other resource routers
const courseRouter = require('./courses.routes');

const router = express.Router();

// re-route into other resourse router
router.use('/:bootcampId/courses', courseRouter);

router
  .route('/')
  .get(advancedResults(Bootcamp, 'courses'), getAll)
  .post(create);
router.route('/:id').get(get).put(update).delete(remove);
router.route('/radius/:zipcode/:distance').get(getByDistance);
router.route('/:id/photo').put(uploadPhoto);

module.exports = router;
