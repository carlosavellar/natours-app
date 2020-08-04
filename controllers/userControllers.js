const User = require('./../models/userModel.js');
const { catchAsync } = require('./../utils/catchAsync');
const handleFactory = require('./../utils/handleFactory');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'Success',
    data: {
      users,
    },
  });
});

exports.getUser = handleFactory.getOne(User);

exports.deleteUser = exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'Success',
    data: null,
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
