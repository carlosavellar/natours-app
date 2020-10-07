const express = require('express');

const viewController = require('./../controllers/viewController');
const authController = require('./../controllers/authController');
const router = express.Router();

router.get('/', authController.protect, viewController.getOverview);
router.get('/login', viewController.getLoginForm);

router.get('/tour/:slug', viewController.getTour);

module.exports = router;
