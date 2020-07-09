const express = require('express');

const userController = require('./../controllers/userControllers');
const authController = require('./../controllers/authController');

const router = express.Router();

router.route('/').get(userController.getAllUsers);
router.post('/signup', authController.signup);
module.exports = router;
