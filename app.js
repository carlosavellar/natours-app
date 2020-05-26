const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes.js');
const app = express();

app.use(express.json());

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use('/api/v1/tours', tourRouter);

module.exports = app;
