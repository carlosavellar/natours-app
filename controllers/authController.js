const User = require('../models/userModel.js');
const { catchAsync } = require('../utils/catchAsync');
const { promisify } = require('util');
const AppError = require('../utils/AppError');
const jwt = require('jsonwebtoken');

const getToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES.IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.baby);
  res.status(200).json({
    status: 'Success',
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.bady;
  if ((!email, !password)) {
    return next(new AppErr(`Email or password are missing`, 400));
  }

  const user = await User.findOne(email).select('+password');

  const correct = user.correctPassword(password, user.password);

  if (!user && correct) {
    return next(new AppError(`Email wor password are wrong`, 400));
  }

  const token = getToken(user.id);

  res.status(200).json({
    status: 'Success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token = '';
  if (!req.headers.authorize || !req.headers.authorize.startsWith('Bearer')) {
    console.log('You have no token');
  } else {
    token = req.headers.authorize.split(' ')[1];
  }

  console.log(jwt);

  const decoded = await promisify(jwt.verify(token, process.env.JWT_SECRET));

  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(new AppError('Yar not logged in. Please log in.'), 401);
  }

  currentUser.changedPasswordAfter(decoded.iat);

  if (currentUser.changedPasswordAfter(currentUser.passwordChangedAt)) {
    return next(
      new AppError('This password was changed. Please log in again'),
      401
    );
  }

  req.user = currentUser;
  next();
});
