const express = require('express');

const userController = require('./../controllers/userControllers');
const authController = require('./../controllers/authController');

const router = express.Router();

router.route('/').get(userController.getAllUsers);
router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.use(authController.protect);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/updateMe', authController.updatePassword);

router.patch('/deleteme', userController.deleteMe);

router.patch('/resetPassword/:token', authController.resetPassword);

router.get('/me', userController.getMe, userController.getUser);

module.exports = router;
