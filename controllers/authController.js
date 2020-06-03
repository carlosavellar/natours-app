const User = require('./../models/userModel');
const { catchAsync } = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/AppError');

const signToken = (tokenId) => {
  return jwt.sign({ id: tokenId }, process.env.JWT_SECRET, {
    experesIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.authentication = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });

  const token = signToken(newUser.id);

  res.status(201).json({
    status: 'Success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { password, email } = req.body;

  //   const token = signToken(user.id);

  if (!password || !email) {
    return next(new AppError('User and email doen´t exist', 400));
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(AppError('Naoa chei esse user', 401));
  }
  res.status(200).json({ status: 200, token });
});
