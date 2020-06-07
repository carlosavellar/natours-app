const User = require('./../models/userModel');
const { catchAsync } = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
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

  res.status(201).json({
    status: 'Success',
    loggedUser: user,
  });
});
