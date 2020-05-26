const express = require('express');

const { getAlltours } = require('./../controllers/tourControllers');

const router = express.Router();

router.route('').get(getAlltours);

module.exports = router;
