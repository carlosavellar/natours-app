const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes.js');
const app = express();
const AppError = require('./utils/AppError');
const errorControllers = require('./controllers/errorControllers');
app.use(express.json());

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use('/api/v1/tours', tourRouter);

app.all('*', (req, res, next) => {
  //   const err = new Error(`This path ${req.originalUrl} doesn´t exist`);
  //   err.status = 'Fail';
  //   err.statusCode = 404;
  next(new AppError(`This path ${req.originalUrl} doesn't exist`));
});

console.log('Caralho Caralho POrra Lua ');

// const ee = 'Teste';
// const ee = 23;

app.use(errorControllers);

module.exports = app;
