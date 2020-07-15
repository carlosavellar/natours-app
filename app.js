const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const hpp = require('hpp');
const xss = require('xss-clean');

const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/errorController');
const errorControler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(helmet());

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'This IP has dot too many requests',
});
app.use(
  hpp({
    whitelist: ['duration'],
  })
);
app.use('/api', limiter);
app.use(
  express.json({
    limit: '10kb',
  })
);
app.use(mongoSanitize());
app.use(xss());
app.use(express.json());

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`This url doesn't exist ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

// app.all('*', (req, res, next) => {
//   // const err = new Error(`This path doesn't exist ${req.originalUrl}`, 404);
//   // err.statuCode = err.statusCode || 400;
//   // err.status = err.status || 'Fail';
//   next(new AppError(`This path doesn't exist ${req.originalUrl}`, 404));
// });

// app.use((err, req, res, next) => {
//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || 'Error';
//   res.status(err.statusCode).json({
//     status: err.status,
//     message: err.message,
//   });
// });

module.exports = app;
