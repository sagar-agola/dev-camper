const User = require('../models/User');
const asyncHandler = require('../middlewares/asyncFunctionHandler');
const ErrorResponse = require('../utils/errorResponse');

// api/auth/register
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const user = await User.create({ name, email, password, role });

  sendTokenResponse(user, 201, res);
});

// api/auth/login
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // make sure request has email and password
  if (!email || !password) {
    return next(
      new ErrorResponse('Email and password are required field', 400)
    );
  }

  // find user by email
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // varify password
  const isMatch = user.matchPassword(user.password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  sendTokenResponse(user, 200, res);
});

// api/auth/me

// private methods
const sendTokenResponse = (user, statusCode, res) => {
  // create token
  const token = user.getSignedToken();

  // cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  // secure cookie in production model
  if (process.env.NODE_ENV == 'production') {
    cookieOptions.secure = true;
  }

  res.status(statusCode).cookie('token', cookieOptions).json({
    success: true,
    token,
  });
};
