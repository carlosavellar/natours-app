const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const { catchAsync } = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');
const { promisify } = require('util');

const signToken = (tokenId) => {
  return jwt.sign({ id: tokenId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
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
  const { email, password } = req.body;
  //   const token = signToken(user.id);
  if (!email || !password) {
    return next(new AppError('Privide an user and e-mail', 400));
  }
  const user = await User.findOne({ email }).select('+password');

  const correct = await user.correctPassword(password, user.password);

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  const token = signToken(user._id);
  res.status(200).json({ status: 'Success', token });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1 check if the token is in the headers
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    console.log('Token exist :alien: ');
    token = req.headers.authorization.split(' ')[1];
  } else {
    console.log('Tem porra nenhuma de token');
  }

  if (!token) {
    return next(new AppError('you are not loogged in. Please Log in', 401));
  }
  // 2 verify token

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  console.log(decoded, '- Decoded');

  // 3 - check if the users exist

  const currentUser = await User.findById(decoded.id);

  currentUser.changedPasswordAfter(decoded.iat);
  console.log(currentUser);
  if (!currentUser) {
    return new AppError('This user does not exist.', 401);
  }

  // 4 - Check if the user changed the password before the token was issused
  if (currentUser.changedPasswordAfter(decoded.passwordChangedAt)) {
    return new AppError('user has changed the password', 401);
  }

  req.user = currentUser;

  next();
});
