const AppError = require('./../utils/appError');

const handleJsonWebTokenError = (err) => {
  return new AppError(`Invalid token, please signing again`, 401);
};

const handleCastError = (err) => {
  return new AppError(`This page ${err.value} doesn't Exist`, 404);
};

const handleDuplicateError = (err) => {
  const path = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `This path doesn't exist ${path}`;
  return new AppError(message, 400);
};

const handleValidationError = (err) => {
  const values = Object.values(err.errors).map((el) => el.message);
  const message = `${values.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrorDevelopment = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    err,
    stack: err.stack,
  });
};

const sendErrorProduction = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.log(err.statusCode);
    res.status(500).json({
      status: 'Error',
      message: 'Something fucking bad happened ☄',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'Error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDevelopment(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    console.log('w');
    let error = { ...err };
    console.log(error);
    if (err.code === 11000) error = handleDuplicateError(error);
    if (err.name === 'CastError') error = handleCastError(error);
    if (err.name === 'ValidationError') error = handleValidationError(error);
    if (err.name === 'JsonWebTokenError')
      error = handleJsonWebTokenError(error);
    sendErrorProduction(error, res);
  }
};
