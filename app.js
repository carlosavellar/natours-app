const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());

app.use('/api/v1/tours', tourRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`This url doesn't exist ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
