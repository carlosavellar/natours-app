const express = require('express');

const { getAllTours } = require('./../controllers/tourControllers');

const router = express.Router();

router.route('/').get(getAllTours);

module.exports = router;
