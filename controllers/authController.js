const User = require('./../models/userModel');
const AppError = require('./../utils/AppError.js');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const { catchAsync } = require('./../utils/catchAsync');

const sendToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });
  const token = sendToken({ id: newUser._id });
  res.status(201).json({
    status: 'Success',
    data: {
      user: newUser,
      token,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { password, email } = req.body;
  if (!password || !email) {
    return next(new AppError(`Password or email are missing`, 401));
  }
  const user = await User.findOne({ email }).select('+password');
  const correct = await user.correctPassword(password, user.password);
  if (!user || !correct) {
    return next(new AppError(`Password or email are wrong`, 401));
  }
  const token = sendToken(user._id);
  res.status(200).json({
    status: 'Success',
    token: token,
    data: {
      user,
    },
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError('User belonging to this token doesn`t exist', 404)
    );
  }
  freshUser.changePasswordAfter(decoded.iat);
  if (freshUser.changePasswordAfter(freshUser.changePasswordAt)) {
    return new AppError('User has changed pasword', 401);
  }
  req.user = freshUser;
  next();
});
