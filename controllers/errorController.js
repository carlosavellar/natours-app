exports.errorController = (err, req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'Error';
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else if (process.env.NODE_ENV === 'production') {
    err.statusCode = err.statusCode || 404;
    err.status = err.status || 'Fail';
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
};
