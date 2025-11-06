const express = require('express');
const authController = require('../controllers/authController');
const authValidators = require('../validators/authValidators');

const router = express.Router();

router.post('/signup', authValidators.validateSignup, authController.signup);
router.post('/login', authValidators.validateLogin, authController.login);

module.exports = router;
