const express = require('express');

const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');
const reviewRoutes = require('./reviewRoutes');
const router = express.Router();

router.use(authController.protect);

router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);
router.route('/tour-stats').get(tourController.getStats);
router
  .route('/')
  .get(authController.restrictTo('user', 'admin'), tourController.getAllTours)
  .post(tourController.createTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

router.use('/:tourId/reviews', reviewRoutes);

// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user', 'lead-guide', 'admin'),
//     reviewController.getAllReviews
//   );
module.exports = router;
