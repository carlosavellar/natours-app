const User = require('./../models/userModels.js');
const { catchAsync } = require('./../utils/catchAsync');
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'Success',
    data: {
      users,
    },
  });
});