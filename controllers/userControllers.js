const User = require('./../models/userModel');
const { catchAsync } = require('./../utils/catchAsync');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'Success',
    data: {
      users: 'All beatfull peop´le ',
    },
  });
});

exports.signUp = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);
  res.status(200).json({
    status: 'Success',
    data: {
      user,
    },
  });
});
