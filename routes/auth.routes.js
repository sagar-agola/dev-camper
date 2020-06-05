const express = require('express');

const { register, login, getMe } = require('../controllers/auth.controller');
const authorize = require('../middlewares/auth');

const router = express.Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/me').get(authorize(), getMe);

module.exports = router;
