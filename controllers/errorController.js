const AppError = require('./../utils/appError');

const handlerValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `ERRORS: ${errors}.join('. ')`;
  return new AppError(message, 401);
};

const handlerDuplicateError = (err) => {
  const url = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `This tour ${err.keyValue.name} already exist`;
  return new AppError(message, 401);
};

const handlerCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const sendDevelopmentError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    err,
    stack: err.stack,
  });
};
const sendProductionError = (err, res) => {
  console.log(err.isOperational);
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.log('🙆🙆🙆🙆🙆');
    res.status(500).json({
      status: 'Error',
      message: 'Something fucking bad motha fucka ☠',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.status = err.status || 'Error';
  err.statusCode = err.statusCode || 500;
  if (process.env.NODE_ENV === 'development') {
    sendDevelopmentError(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (err.code === 11000) error = handlerDuplicateError(error);
    if (err.name === 'CastError') error = handlerCastError(error);
    if (err.name === 'ValidationError') error = handlerValidationError(error);
    sendProductionError(error, res);
  }
};
