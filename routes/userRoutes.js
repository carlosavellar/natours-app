const express = require('express');
const router = express.Router();

const { login, signUp } = require('./../controllers/authController');
const {
  testRouting,
  getAllUsers,
} = require('./../controllers/userControllers');

router.route('/').get(getAllUsers);
router.route('/teste').get(testRouting);
router.post('/signup', signUp);
router.post('/login', login);

module.exports = router;
