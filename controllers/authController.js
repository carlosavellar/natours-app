const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');

const User = require('./../models/userModels');
const catchAsync = require('./../utils/catchAsync');
const sendMail = require('./../utils/email');
const AppError = require('./../utils/appError');

const signInToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signInToken(user._id);

  // if(process.env.NODE_ENV === 'prodution') re.
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  user.password = undefined;
  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    message: 'Success',
    token,
    data: { user },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  // const token = signInToken(user._id);

  // res.status(201).json({
  //   message: 'Success',
  //   user,
  //   token,
  // });

  createSendToken(user, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email && !password) {
    return next(new AppError('Password or email are missing', 401));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Email or password are wrong', 401));
  }
  const token = signInToken(user._id);
  res.status(200).json({
    status: 'Success',
    user,
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in ', 401));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);

  if (currentUser.passwordChangedAfter(decoded.iat)) {
    return next(new AppError('This token is spired. Please log in again', 401));
  }
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You don`t have privileges', 401));
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) return next(new AppError('This user does not exist', 404));

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  console.log(resetToken);

  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  console.log(resetUrl);

  const message = `Click at the link above to reset your password
  If don't made this actions, please ignore this email \n ${resetUrl}`;

  try {
    await sendMail({
      email: user.email,
      subject: 'E-mail recover',
      message,
    });
    res.status(200).json({
      status: 'Success',
      message: 'Token sent to the email ',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpiration = undefined;
    user.password = undefined;
    user.passwordConfirm = undefined;
    await user.save();
    return next(
      new AppError(
        `Some error happen trying to send the email. Please try agin latter ${errr} `,
        500
      )
    );
  }
  signInToken({});
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpiration: { $gte: Date.now() },
  });

  if (!user) {
    return next(new AppError('No user to reset the password', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpiration = undefined;
  await user.save();

  const token = signInToken({ id: user._id });

  console.log('resetToken');

  res.status(200).json({
    status: 'Success',
    token,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  console.log(req.user.id + "****** ID");
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('The actual password is wrong', 401));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  try{
      await user.save();

  }catch(err){
      console.log(err);
  }
  createSendToken(user, 200, res);
});
