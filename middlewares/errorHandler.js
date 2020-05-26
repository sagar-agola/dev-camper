const ErrorResponse = require('../utils/errorResponse');

const errorhandler = (err, req, res, next) => {
    let error = { ...err };

    error.message = err.message;

    console.log(`${err}`.bgWhite.red);

    // mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = `Resourse not foud with Id: ${err.value}`;
        error = new ErrorResponse(message, 404);
    }

    // mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = new ErrorResponse(message, 400);
    }

    // mongoose validation errors
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        error = new ErrorResponse(message, 400);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        data: error.message || 'Server Error.'
    });
}

module.exports = errorhandler;