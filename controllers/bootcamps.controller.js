const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/asyncFunctionHandler');
const geoCoder = require('../utils/geocoder');

// api/bootcamps
exports.getAll = asyncHandler(async (req, res, next) => {
  const response = {
    success: res.advancedResults.success,
    count: res.advancedResults.count,
    pagination: res.advancedResults.pagination,
    data: res.advancedResults.results,
  };

  res.status(200).json(response);
});

// api/bootcamps/:id
exports.get = asyncHandler(async (req, res, next) => {
  let query;

  // select fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = Bootcamp.findById(req.params.id).select(fields);
  } else {
    query = Bootcamp.findById(req.params.id);
  }

  const bootcamp = await query;

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Resourse not foud with Id: ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

// api/bootcamps
exports.create = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({
    syccess: require,
    data: bootcamp,
  });
});

// api/bootcamps/:id
exports.update = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Resourse not foud with Id: ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: bootcamp });
});

// api/bootcamps/:id
exports.remove = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Resourse not foud with Id: ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true });
});

// api/bootcamps/radius/:zipcode/:distance
exports.getByDistance = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  //get lat/lng from zipcode
  const loc = await geoCoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calc radius using radians
  // Divide dist by radius of Earth
  // Earth Radius = 3,963 mi / 6,378 km
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});
