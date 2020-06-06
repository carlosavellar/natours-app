const AppError = require('./../utils/AppError');

const handleDuplicateErrDB = (err) => {
  const tour = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `This tour already exist ${tour}`;
  return new AppError(message, 400);
};

const handleValidationError = (err) => {
  // console.log(err.errors);
  console.log(Object.entries('___', err.errors), '____');
  const allErrors = Object.entries(err.errors).map((el) => el);
  const message = `These are the errors: ${allErrors.join(' ')}`;
  return new AppError(message, 400);
};

const handCastErrorDB = (err) => {
  console.log('Cast ERRORRR');
  const message = `This tour do not exist ${err.value}, boddy`;
  return new AppError(message, 400);
};

const handleJsonWebTokenError = () => {
  return new AppError('You are not loogged in. Please log in', 401);
};

const handleJsonWebTokenExpiredError = () => {
  return new AppError('This token is expired! Please log in again.', 401);
};
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.log(err.isOperational);
    res.status(500).json({
      status: 'Error',
      message: 'Something went very Bad',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 400;
  err.status = err.status || 'Error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (err.name === 'CastError') error = handCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateErrDB(error);
    if (err.name === 'ValidationError') error = handleValidationError(error);
    if (error.name === 'CastError') handCastErrorDB(error);
    if (error.name === 'JsonWebTokenError')
      error = handleJsonWebTokenError(error);
    if (error.name === 'TokenExpiredError')
      error = handleJsonWebTokenExpiredError(error);
    sendErrorProd(error, res);
  }
};
