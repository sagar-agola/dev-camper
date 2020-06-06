const path = require('path');
const fs = require('fs');

const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/asyncFunctionHandler');
const geoCoder = require('../utils/geocoder');

// GET: api/bootcamps
exports.getAll = asyncHandler(async (req, res, next) => {
  const response = {
    success: res.advancedResults.success,
    count: res.advancedResults.count,
    pagination: res.advancedResults.pagination,
    data: res.advancedResults.results,
  };

  res.status(200).json(response);
});

// GET: api/bootcamps/:id
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

// POST: api/bootcamps
exports.create = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({
    syccess: require,
    data: bootcamp,
  });
});

// PUT: api/bootcamps/:id
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

// DELETE: api/bootcamps/:id
exports.remove = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Resourse not foud with Id: ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true });
});

// GET: api/bootcamps/radius/:zipcode/:distance
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

// POST: api/bootcamps/:id/photo
exports.uploadPhoto = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  // make sure bootcamp exists
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Resourse not foud with Id: ${req.params.id}`, 404)
    );
  }

  // make sure there is a file present in request
  if (!req.files) {
    return next(
      new ErrorResponse('You need to send file in order to upload', 400)
    );
  }

  const file = req.files.file;

  // make sure file is image file
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse('You need to upload Image file', 400));
  }

  // make sure image is small enough
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Image size must be less than ${process.env.MAX_FILE_UPLOAD} bytes`,
        400
      )
    );
  }

  // create file name
  const fileName = `bootcampPhoto_${bootcamp._id}${path.parse(file.name).ext}`;
  const filePath = path.join(process.env.FILE_UPLOAD_PATH, fileName);

  // create file
  file.mv(filePath, async (error) => {
    if (error) {
      console.log(`${error}`.bgWhite.red);
      return next(new ErrorResponse('problem with photo upload', 500));
    }

    await Bootcamp.findByIdAndUpdate(bootcamp._id, { photo: fileName });

    res.status(200).json({ success: true, data: fileName });
  });
});
