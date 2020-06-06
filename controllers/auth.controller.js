const User = require('../models/User');
const asyncHandler = require('../middlewares/asyncFunctionHandler');
const ErrorResponse = require('../utils/errorResponse');

// POST: api/auth/register
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const user = await User.create({ name, email, password, role });

  sendTokenResponse(user, 201, res);
});

// POST: api/auth/login
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

// GET: api/auth/me
exports.getMe = (req, res, next) => {
  res.status(200).json({ success: true, data: req.user });
};

// PUT api/auth/update-profile
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: user });
});

// POST api/auth/update-password
exports.updatePassword = asyncHandler(async (req, res, next) => {
  // validate request
  if (!req.body.currentPassword || !req.body.newPassword) {
    return next(
      new ErrorResponse(
        'Current Password and New Password are required field.',
        400
      )
    );
  }

  // get user
  const user = await User.findById(req.user.id).select('+password');

  // compare password
  const isValidPassword = await user.matchPassword(req.body.currentPassword);

  if (!isValidPassword) {
    return next(new ErrorResponse('Invalid current password.', 401));
  }

  // updae password
  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

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

  res.status(statusCode).cookie('token', token, cookieOptions).json({
    success: true,
    token,
  });
};
