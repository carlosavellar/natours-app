const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
  review: {
    type: String,
    require: [true, 'Write some review'],
  },
  rating: {
    type: Number,
    max: 5,
    min: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    require: [true, 'Choose an tour'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    require: [true, 'Choose an user'],
  },
});

reviewSchema.pre('save', function (next) {
  this.populate({
    path: 'Tour',
    select: 'name',
  }).populate({
    path: 'Tour',
    select: 'name photo',
  });
  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
