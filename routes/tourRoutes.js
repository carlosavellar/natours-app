const express = require('express');

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

router.route('/').get(getAllTours).post(createTour);

router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
