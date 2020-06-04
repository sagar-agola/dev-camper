const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required field'],
  },
  email: {
    type: String,
    required: [true, 'Email is required field'],
    unique: [true, 'Email already taken'],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email'],
  },
  role: {
    type: String,
    enum: { values: ['user', 'publisher'], message: 'Invalid role value' },
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Password is required field'],
    minlength: [6, 'Password must be atleast 6 character long'],
    maxlength: [128, 'Password can not be longer than 128 characters'],
    select: false,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedToken = function () {
  return jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
