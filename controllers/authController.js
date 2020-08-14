const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const rateLimiter = require('express-rate-limit');

const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const { sendMail } = require('./../utils/sendEmail');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);

  const cooKieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cooKieOptions.secure = true;

  user.password = undefined;

  res.cookie('jwt', token, cooKieOptions);

  res.status(statusCode).json({
    status: 'Success',
    token,
    data: { user },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    roles: req.body.roles,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  if (!token) {
    return next(new AppError('Nenhum token', 401));
  }

  createSendToken(user, 201, res);
  // res.status(201).json({
  //   status: '✅ Success',
  //   token,
  //   data: {
  //     user,
  //   },
  // });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    next(new AppError('Password or email are missing', 401));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    next(new AppError('Password or email are wrong', 401));
  }

  createSendToken(user, 201, res);
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
  // console.log(`⚾ ${decoded}`);

  // console.log('Do funcionário pública');
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

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user.roles) {
      return next(new AppError(`Access not allowed`, 401));
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError(`This user does not exist`, 404));
  }

  console.log(user, '*************');

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${req.params.token}`;

  const message = `This is a message to reset your password. Please copy the URL ${resetURL} paste at the browser to procide`;

  try {
    await sendMail({
      user: user.email,
      subject: 'Reset password',
      message,
    });
    res.status(200).json({
      status: 'Success',
      message: 'Reset URL sent to email',
    });
  } catch (err) {
    user.passwordChangedAt = undefined;
    user.passwordResetToken = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError(`There is an error sending the email`, 500));
  }
});

exports.resetPassword = catchAsync(async function (req, res, next) {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordExpiresAt: { $gte: Date.now() },
  });

  if (!user) {
    return next(new AppError(`Token is invalid or has expired `, 400));
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordExpiresAt = undefined;
  await user.save();

  const token = signToken(user._id);

  res.status(200).json({
    status: 'Success',
    token,
    message: 'User logged in',
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  if (!req.body.password && !req.body.confirmPassword) {
    return next(new AppError('Fill with a password', 401));
  }

  const user = await User.findById(req.user.id);

  if (!user.correctPassword(req.body.password, user.password)) {
    return next(new AppError('Passwords don`t match', 401));
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save({ validateBeforeSave: true });
  next();
});

// exports.updateMe = catchAsync(async (req, res, next) => {
//   if (!req.body.password || !req.body.confirmPassword) {
//     return next(new AppError('Password or email are missing', 401));
//   }
//   const filteredBody = filterBy(req.body, 'email', 'name');
//   const user = await User.findByIdAndUpdate(req.params.id, filteredBody, {
//     new: true,
//     validateBeforeSave: true,
//   });
//   user.name = 'José Carlos Broathers';
//   await user.save();
//   res.status(201).json({
//     status: 'Success',
//   });
// });

exports.deleteUser = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { action: false });

  await user.save();

  res.status(204).json({
    status: 'Success',
    data: null,
  });
});
