const crypto = require('crypto');

const User = require('../models/User');
const asyncHandler = require('../middlewares/asyncFunctionHandler');
const ErrorResponse = require('../utils/errorResponse');
const sendMail = require('../utils/sendMail');

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
  const user = await User.findOne({ email }).select('+password +passwordSalt');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // varify password
  const isMatch = await user.matchPassword(password);

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

// POST api/auth/forgot-password
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // make sure request body conains email
  if (!req.body.email) {
    return next(new ErrorResponse('Email is required field', 400));
  }

  // find user by Id
  const user = await User.findOne({
    email: req.body.email,
  });

  if (!user) {
    return next(
      new ErrorResponse(`User not found with Email: ${req.body.email}`, 404)
    );
  }

  // generate reset password token
  const resetPasswordToken = user.getResetPasswordToken();

  // save user data with reset password token and expiration time field
  await user.save({
    validateBeforeSave: false,
  });

  // create reset Url
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/auth/reset-password/${resetPasswordToken}`;

  // mail body
  const message = `You are receiving this email because you (or someone else) has requested the reset of 
    a password. Please make a PUT request to: \n\n ${resetUrl}`;

  // send mail
  try {
    await sendMail({
      email: user.email,
      subject: 'password reset token',
      message,
    });

    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (error) {
    console.log(`${error}`.bgWhite.red);

    // save user with reset password token as undefined
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    // send response
    return next(new ErrorResponse('Email could not be sent', 500));
  }
});

// PUT /api/auth/reset-password/:resetToken
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // make sure new password is present in request body
  if (!req.body.password) {
    return next(new ErrorResponse('Password is required field', 400));
  }

  // generate hash of reset token
  const hashedResetToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  // find user by reset token
  let user = await User.findOne({
    resetPasswordToken: hashedResetToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  // make sure user exists
  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }

  // set new password and save user details
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  // send response
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
