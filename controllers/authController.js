const User = require('./../models/userModels.js');
const { catchAsync } = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const AppError = require('./../utils/AppError');

const signToken = (id) => {
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

  const token = signToken(newUser._id);

  res.status(200).json({
    status: 'Success',
    data: {
      newUser,
      token,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Provide an email and password', 401));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || (await !user.correctPassword(password, user.password))) {
    return next(new AppError('Email or passowrd are wrong', 401));
  }

  const token = signToken(user._id);

  res.status(200).json({
    status: 'Success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token = '';
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else {
    return next(new AppError('You are not loggerd in.Please log in', 401));
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please log in!', 401));
  }

  const decoded = await promisify(jwt.verify(token, process.env.JWT_SECRET));

  const currentUser = User.findById(decoded.id);

  currentUser.changedPassword(decoded.iat);

  currentUser.changedPassword(decoded.passwordChangedAt);

  if (currentUser.changedPassword(decoded.passwordChangedAt)) {
    return next(new AppError('This passwordhas changed. Please log in', 401));
  }

  req.user = currentUser;

  console.log(token);
  next();
});
