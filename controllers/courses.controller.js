const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/asyncFunctionHandler');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');

// api/courses
// api/bootcamps/:bootcampId/courses
exports.getAll = asyncHandler(async (req, res, next) => {
  let response;

  if (req.params.bootcampId) {
    const count = await Bootcamp.countDocuments({ _id: req.params.bootcampId });

    if (count > 0) {
      response = {
        success: res.advancedResults.success,
        count: await res.advancedResults.query.countDocuments({
          bootcamp: req.params.bootcampId,
        }),
        pagination: res.advancedResults.pagination,
        data: await res.advancedResults.query.find({
          bootcamp: req.params.bootcampId,
        }),
      };
    } else {
      return next(
        new ErrorResponse(
          `Bootcamp not found with id: ${req.params.bootcampId}`,
          404
        )
      );
    }
  } else {
    response = {
      success: res.advancedResults.success,
      count: res.advancedResults.count,
      pagination: res.advancedResults.pagination,
      data: res.advancedResults.results,
    };
  }

  res.status(200).json(response);
});

// api/courses/:id
exports.get = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description',
  });

  if (!course) {
    return next(
      new ErrorResponse(`Resourse not found with id: ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: course });
});

// api/bootcamps/:bootcampId/courses
exports.add = asyncHandler(async (req, res, next) => {
  console.log(req.params);
  // check if bootcamp exists
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Bootcamp not found with id: ${req.params.bootcampId}`,
        404
      )
    );
  }

  // append bootcampId from parameter to req.body
  req.body.bootcamp = req.params.bootcampId;

  // create course
  const course = await Course.create(req.body);

  res.status(201).json({ success: true, data: course });
});

// api/courses/:id
exports.update = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`Course not found with id: ${req.params.id}`, 404)
    );
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: course });
});

// api/courses/:id
exports.remove = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`Course not found with id: ${req.params.id}`, 404)
    );
  }

  course.remove();

  res.status(200).json({ success: true });
});
