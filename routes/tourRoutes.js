const express = require('express');

const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const router = express.Router();
const reviewController = require('./../controllers/reviewController');
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);
router.route('/tour-stats').get(tourController.getStats);
router
  .route('/')
  .get(authController.protect, tourController.getAlltours)
  .post(tourController.createTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

router.route('/:tourId/reviews').post(
  authController.protect,
  // authController.restrictTo('user'),
  reviewController.createReview
);
module.exports = router;
