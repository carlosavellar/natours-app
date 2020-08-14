const express = require('express');

const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router({
  mergeParams: true,
});

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user', 'lead-guide', 'admin'),
    reviewController.createReview
  );

router.route('/:tourId').get(reviewController.getReview);

module.exports = router;
