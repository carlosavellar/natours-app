const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorController = require('./controllers/errorController');
const app = express();
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`This path doesn't exist ${req.originalUrl}`));
});

app.use(globalErrorController);

module.exports = app;
