const express = require('express');
const morgan = require('morgan');
const rateLimiter = require('express-rate-limit');
const xss = require('xss-clean');
const helmet = require('helmet');
const mongoSanitize = require('mongo-sanitize');

const AppError = require('./utils/appError');
const globalErrorController = require('./controllers/errorController');
const app = express();
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// app.use(mongoSanitize());

const limiter = rateLimiter({
  max: 2,
  windowMs: 24 * 60 * 60 * 1000,
  message: 'You reached the maximum number of request',
});

app.use('/api', limiter);

app.use(helmet());
app.use(xss());

app.use(
  express.json({
    limit: '10kb',
  })
);

app.use(express.json());

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`This path doesn't exist ${req.originalUrl}`));
});

app.use(globalErrorController);

module.exports = app;
