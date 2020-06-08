const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/asyncFunctionHandler');
const Review = require('../models/Review');
const Bootcamp = require('../models/Bootcamp');

// GET /api/reviews
// GET /api/bootcamps/:bootcampId/reviews
exports.getAll = asyncHandler(async (req, res, next) => {
  res.status(200).json({ success: true, data: 'It works' });
});

// GET /api/reviews/:id
exports.get = asyncHandler(async (req, res, next) => {
  res.status(200).json({ success: true, data: 'It works' });
});

// POST /api/bootcamps/:bootcampId/reviews
exports.create = asyncHandler(async (re, res, next) => {
  res.status(200).json({ success: true, data: 'It works' });
});

// PUT api/reviews/:id
exports.update = asyncHandler(async (req, res, nex) => {
  res.status(200).json({ success: true, data: 'It works' });
});

// DELETE api/reviews/:id
exports.remove = asyncHandler(async (req, res, nex) => {
  res.status(200).json({ success: true, data: 'It works' });
});
