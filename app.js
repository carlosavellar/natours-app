const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const AppError = require('./utils/appError');
const errorController = require('./constroller/errorController');
const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());

app.use('/api/v1/tours', tourRouter);

app.all('*', (req, res, next) => {
  // const err = new Error(`This URL doesn't exist ${req.originalUrl}`);
  // err.statusCode = err.statusCode || 404;
  // err.status = err.status || 'Error';
  next(new AppError(`This URL doesn't exist ${req.originalUrl}`, 404));
});

app.use(errorController);

module.exports = app;
