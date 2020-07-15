const mongoose = require('mongoose');
const User = require('./../models/userModel');
const Tour = require('./../models/tourModel');
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      require: [true, 'Write some review'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      validade: [
        (val) => {
          val > 2 && val < 5;
        },
        'rating must be less than 2 or more than 5',
      ],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a Tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to an user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'tour',
    select: 'name',
  }).populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

/// now setting the parent referencig / Tout and User Re
