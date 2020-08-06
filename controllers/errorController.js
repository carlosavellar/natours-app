const AppError = require('./../utils/AppError');

const handleDuplicateError = (err) => {
  const url = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `This name already exist ${url}`;
  return new AppError(message, 401);
};
const handleValidationError = (err) => {
  const errors = Object.keys(err.errors).map((el) => el.message);
  const message = `Errors: ${errors}.join('. ')`;
  return new AppError(message, 401);
};

const handleCastError = (err) => {
  const message = `${err.name}: ${err.originalUrl}`;
  return new AppError(message, 401);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
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
    console.log('Something 🔥 very bad has just happend');
    res.status(500).json({
      status: 'Error',
      message: 'Something 🔥 very bad has just happend',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'Error';
  if (process.env.NODE_ENV === 'development') {
    console.log(err.name);
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (error.code === 11000) error = handleDuplicateError(error);
    if (error.name === 'ValidationError') error = handleValidationError(error);
    if (error.name === 'CastError') error = handleCastError(error);

    sendErrorProd(error, res);
  }
};
