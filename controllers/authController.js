const User = require('./../models/userModels');
const { catchAsync } = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/AppError');

const createToken = ({ id }) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    photo: req.body.photo,
    role: req.body.role,
    password: req.body.password,
  });

  console.log(newUser);

  const token = createToken({ id: newUser._id });

  res.status(201).json({
    status: 'Success Created',
    token: token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Password or email are missing', 400));
  }

  const user = await User.findOne(email).select('+password');

  if (!user && (await !user.correctPassword(password, user.password))) {
    return next(new AppError('Email or password are wrong', 401));
  }

  res.status(200).json({
    status: 'Success Created',
    token: token,
    data: {
      user: newUser,
    },
  });
});
