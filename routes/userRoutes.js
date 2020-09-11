const express = require('express');

const authController = require('./../controllers/authController');
const userController = require('./../controllers/userController');

const router = express.Router();

router.route('/').get(userController.getAllUsers);

router.post('/signup', authController.signUp);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect, authController.restrictTo('user'));

router.route('/').get(userController.getAllUsers);

router.route('/deleteMe').delete(userController.deleteMe);

router.patch('/updatePassword', authController.updatePassword);

router.route('/me').get(userController.getMe, userController.getUser);

router.patch('/updateMe', userController.updateMe);

module.exports = router;
