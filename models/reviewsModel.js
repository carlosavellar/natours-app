const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Write some review'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    reviewDate: {
      type: Date,
      default: Date.now(),
    },
    tour: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Choose a tour'],
      },
    ],
    user: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Choose a user'],
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/ˆfind/, function (next) {
  this.populate({
    path: 'tour',
    select: ['name'],
  }).populate({
    path: 'user',
    select: ['name'],
  });
  next();
});
// reviewSchema.virtual('reviews').get(function (next) {
//   this.tour = next();
// });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
