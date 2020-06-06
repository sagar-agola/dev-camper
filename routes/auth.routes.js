const express = require('express');

const {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword,
} = require('../controllers/auth.controller');
const authorize = require('../middlewares/auth');

const router = express.Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/me').get(authorize(), getMe);
router.route('/update-profile').put(authorize(), updateProfile);
router.route('/update-password').post(authorize(), updatePassword);

module.exports = router;
