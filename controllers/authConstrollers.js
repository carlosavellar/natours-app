const User = require('./../models/userModel');
const { catchAsync } = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');
const jwt = require('jsonwebtoken');
const signInToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  const token = signInToken(newUser._id);

  res.status(201).json({
    status: 'Success',
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  // finding the user
  const { email, password } = req.body;

  if (!email || !password) {
    return new AppError('user or email doesn´t exist', 400);
  }

  const user = await User.findOne({ email }).select('+password');

  const correct = user.correctPassword(user._id);

  if (!user || !correct) {
    return new AppError('Incorrect password', 400);
  }
  const token = signInToken(user._id);

  res.status(201).json({
    status: 'Success',
    token,
  });
});
