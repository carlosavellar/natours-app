const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const AppError = require('./utils/appError.js');
const globalErrorController = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const app = express();

app.set('view engine', 'pug');

app.set('views', path.join(__dirname, './views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  express.json({
    limit: '10kb',
  })
);

app.use(helmet());
app.use(mongoSanitize());
app.use(xss());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Your requests overstepped the limiter',
});

app.use('/api', limiter);

app.use(express.json());

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/review', reviewRouter);
app.use('/', viewRouter);

app.get('/', (req, res) => {
  res.status(200).render('base', {
    tour: 'Tour',
  });
});
app.all('*', (req, res, next) => {
  next(new AppError(`This URL doesn't exist ${req.originalUrl}`, 400));
});

app.use(globalErrorController);

module.exports = app;
