const express = require('express');

const userController = require('./../controllers/userController.js');
const authController = require('./../controllers/authController');
const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.route('/').get(authController.protect, userController.getAllUsers);

module.exports = router;
