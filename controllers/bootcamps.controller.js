const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/asyncFunctionHandler');
const geoCoder = require('../utils/geocoder');

exports.getAll = asyncHandler(async (req, res, next) => {
    let query;

    const reqQuery = { ...req.query };

    // fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // loop over removed fields and remove from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // create query string and create operators (gt => $gt)
    let queryString = JSON.stringify(reqQuery);
    queryString = queryString.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // find resource
    query = Bootcamp.find(JSON.parse(queryString));

    // select fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    // sort
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    // pagination
    let pageNumber = parseInt(req.query.page, 10) || 1;
    const page = pageNumber > 0 ? pageNumber : 1;
    const limit = parseInt(req.query.limit, 10) || 2;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Bootcamp.countDocuments();

    query = query.skip(startIndex).limit(limit);

    // executing query
    const bootcamps = await query;

    // paginaion result 
    const pagination = {};

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit: limit
        };
    }

    if (startIndex > 0 && startIndex < total) {
        pagination.prev = {
            page: page - 1,
            limit: limit
        };
    }

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        pagination: pagination,
        data: bootcamps
    });
});

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
        return next(new ErrorResponse(`Resourse not foud with Id: ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: bootcamp
    });
});

exports.create = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.create(req.body);

    res.status(201).json({
        syccess: require,
        data: bootcamp
    });
});

exports.update = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!bootcamp) {
        return next(new ErrorResponse(`Resourse not foud with Id: ${req.params.id}`, 404));
    }

    res.status(200).json({ success: true, data: bootcamp });
});

exports.remove = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse(`Resourse not foud with Id: ${req.params.id}`, 404));
    }

    res.status(200).json({ success: true });
});

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
        location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    });

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    });
});