const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
// const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const errorController = require('./controllers/errorController');
const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());

app.use('/api/v1/tours', tourRouter);
// app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`This URL doesn't exist ${req.originalUrl}`, 404));
});

app.use(errorController);

module.exports = app;
