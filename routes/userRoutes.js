const express = require('express');

const { getAllUsers, signUp } = require('./../controllers/userControllers');
const { login } = require('./../controllers/authController');
const router = express.Router();

router.route('/signup').post(signUp);
router.route('/login').get(login);

module.exports = router;
