const mongoose = require('mongoose');
const validator = require('validator');

const tourSchema = mongoose.Schema({
  name: {
    type: String,
    required: ['true', 'Prease put a name'],
    validate: [validator.isEmail, 'Please provide a e-mail'],
    maxlength: 16,
    minlength: 5,
  },
  duration: {
    type: Number,
  },
  maxGroupSize: {
    type: Number,
  },
  difficulty: {
    type: String,
    required: ['true', 'Choose a difficulty'],
    enum: {
      values: ['easy', 'medium', 'hard'],
      message: 'Difficulty must be easy, medium or hard',
    },
  },
  ratingsAverage: {
    type: Number,
    max: 5,
    min: 2,
  },
  ratingsQuantity: {
    type: Number,
  },
  price: {
    type: Number,
    validade: [validator.isNum],
  },
  summary: {
    type: String,
  },
  description: {
    type: String,
  },
  imageCover: {
    type: String,
  },
  images: [String],
  startDates: [Date],
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
