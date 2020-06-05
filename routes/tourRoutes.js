const express = require('express');
const authController = require('./../controllers/authController');

const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  getTopTours,
  getStats,
  getMonthStats,
} = require('./../controllers/tourControllers');

const router = express.Router();

router.route('/top-tours').get(getTopTours, getAllTours);

router.route('/plan/:year').get(getMonthStats);
router.route('/stats').get(getStats);

router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

router.route('/').get(authController.protect, getAllTours).post(createTour);
module.exports = router;
