const User = require('./../models/userModel');
const { catchAsync } = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

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
    token,
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

  const correct = user.correctPassword(password, user.password);

  if (!user || !correct) {
    return next(new AppError('Incorrect password', 400));
  }
  const token = signInToken(user._id);

  res.status(201).json({
    status: 'Success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  console.log('__-');
  //1 check if the authrotization is there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else {
    return next(new AppError('You are not logged in. Please log in', 401));
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please log in', 401));
  }

  const decoded = await promisify(jwt.verify(token, process.env.JWT_SECRET));

  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(new AppError('You are not logged in. Please log in', 401));
  }
  currentUser.changedPasswordAt(decoded.iat);

  if (currentUser.changedPassword(decoded.passwordChangedAt)) {
    return next(new AppError('You are not logged in. Please log in', 401));
  }

  req.user = currentUser;
  console.log(req.headers.authorization);
  next();
});
