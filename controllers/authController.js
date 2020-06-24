const User = require('./../models/userModels');
const { catchAsync } = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/AppError');
const { promisify } = require('util');
const sendEmail = require('./../utils/email');
const crypto = require('crypto');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    status: 'Success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });

  createAndSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Password or email are missing', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Email or password are wrong', 401));
  }

  const token = signToken(user._id);

  createAndSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token = '';
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in', 401));
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(req.headers);
  const currentUser = await User.findById(decoded.id);
  currentUser
    ? console.log('Existe---', currentUser)
    : console.log('nao existe');

  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // console.log(currentUser);

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('You are not logged in.Please Log in', 401));
  }

  req.user = currentUser;
  next();
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("This user doesn't exist", 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // send e-mail

  const url = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/fortpassword/${resetToken}}`;

  const message = `You´ve requested a ppassword reset. \n Please click in yhe link below and choose password and confirm the passowrd \n ${url}`;
  try {
    await sendEmail({
      email: user.email,
      subject: `Passowrdis valid for 10`,
      message,
    });
    createAndSendToken(user, 200, res);
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetSpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Something went wrong', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token has spired or is invalid', 400));
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();
  const token = signToken(user._id);

  createAndSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) get user from the collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) check if the password is correct

  if (!(await user.correctPassword(user.confirmPassword, user.password))) {
    return next(new AppError('Your current password are wrong', 404));
  }

  // 3) Update the password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;

  await user.save();
  // res.status('201').json({

  // 4) Log  the user in, semd JWT
  // const token = signToken(user._id);

  //   status: 'Password updated',
  //   token,
  // });
  createAndSendToken(user, 201, res);
});
