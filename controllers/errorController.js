const AppError = require('./../utils/appError');

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `${errors}.join('. ')`;
  return new AppError(message, 404);
};

const handleDuplicateError = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  return new AppError(`This tour ${value} already exist`, 400);
};

const handleCastError = (err) => {
  console.log('____');
  const message = `This URL ${err.path} : ${err.value} already exist`;
  return new AppError(message, 400);
};

const sendDevError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    err: err,
    stack: err.stack,
  });
};

const sendProdError = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('Something bad 🎇 has happened', err.isOperational);
    res.status(500).json({
      status: 'Error',
      message: 'Something bad has happened',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'Error';
  if (process.env.NODE_ENV === 'development') {
    sendDevError(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (error.code === 11000) error = handleDuplicateError(error);
    if (error.name === 'ValidationError') error = handleValidationError(error);

    if (error.name === 'CastError') error = handleCastError(error);
    sendProdError(error, res);
  }
};
