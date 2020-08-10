const { promisify } = require('util');

const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  if (!token) {
    return next(new AppError('Nenhum token', 401));
  }
  res.status(201).json({
    status: '✅ Success',
    token,
    data: {
      user,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    next(new AppError('Password or email are missing', 401));
  }

  const user = await User.findOne({ email }).select('password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    next(new AppError('Password or email are wrong', 401));
  }

  const token = signToken(user._id);

  res.status(201).json({
    status: 'Success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else {
    console.log('Pensamento liberal ');
  }
  if (!token) {
    return next(new AppError('No token in the room', 401));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(`⚾ ${decoded}`);

  console.log('Do funcionário pública');
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError('User belonging to this token no longer exist', 401)
    );
  }

  if (currentUser.changedPassword(decoded.iat)) {
    return next(new AppError('The password has changed before ', 401));
  }

  req.user = currentUser;
  next();
});
