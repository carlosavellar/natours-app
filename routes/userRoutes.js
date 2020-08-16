const express = require('express');

const authController = require('./../controllers/authController');
const userController = require('./../controllers/userControllers');
const router = express.Router();

router.post('/signUp', authController.signUp);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.delete('/delete', authController.deleteUser);
router.patch(
  '/updateMe',
  authController.protect,
  authController.updatePassword
);

router.use(authController.protect);

router
  .route('/')
  .get(authController.restrictTo('users'), userController.getAllUsers);
router
  .route('/me')
  .get(
    authController.restrictTo('users', 'lead-guide', 'admin'),
    userController.getMe
  );

module.exports = router;
