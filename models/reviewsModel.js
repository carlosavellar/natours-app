const mongoose = require('mongoose');
const Tour = require('./tourModel');

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

reviewSchema.statics.calcAvgRating = async function (tour) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRatings: { $num: +1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      avgRate,
    },
  });

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRatings,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 0,
    });
  }
};

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.post(/ˆfindOneAnd/, async function (next) {
  this.r = await Tour.findOne();
  next();
});

reviewSchema.post(/ˆfindOneAnd/, async function (next) {
  this.r.constructor.calcAvgRating(this.r.tour);
  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
