const jwt = require('jsonwebtoken');

const User = require('../models/User');
const asyncHandler = require('./asyncFunctionHandler');
const ErrorResponse = require('../utils/errorResponse');

module.exports = (...allowedRoles) =>
  asyncHandler(async (req, res, next) => {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // set token from header
      token = req.headers.authorization.split(' ')[1];
    } else if (process.env.NODE_ENV == 'production' && req.cookies.token) {
      // set token from cookie
      token = req.cookies.token;
    }

    // make sure request contains token header
    if (!token) {
      return next(
        new ErrorResponse('You are not authorized to access this route.', 401)
      );
    }

    try {
      // decode and verify token
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

      // find currently logged in user and attach it with request
      req.user = await User.findById(decodedToken.id);

      // add check for roles is specified
      if (allowedRoles.length !== 0) {
        // check role
        if (!allowedRoles.includes(req.user.role)) {
          return next(
            new ErrorResponse(
              `User role ${req.user.role} is not authorized to access this route`,
              401
            )
          );
        }
      }

      // user is authorized pass request to controller/next middleware
      next();
    } catch (error) {
      return next(
        new ErrorResponse('You are not authorized to access this route.', 401)
      );
    }
  });
