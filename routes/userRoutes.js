const express = require('express');
const authController = require('./../controllers/authConstrollers');

const router = express.Router();

router.post('/signup', authController.signup);

module.exports = router;
