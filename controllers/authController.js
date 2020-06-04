const User = require('./../models/userModel');
const { catchAsync } = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/AppError');

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

  console.log(correct, '000');
  console.log(user);

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  const token = signToken(user._id);
  res.status(200).json({ status: 'Success', token });
});
