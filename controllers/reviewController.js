const Review = require('./../models/reviewModel.js');
const { catchAsync } = require('./../utils/catchAsync');
const APIFeatures = require('./../utils/APIfeatures');

exports.userReviews = catchAsync(async (req, res, next) => {
  // const reviews = await Review.find();

  const apiFeatures = new APIFeatures(Review.find(), req.query)
    .filtered()
    .paginate()
    .sortBy()
    .limitFields();
  const reviews = await apiFeatures.query;
  console.log(reviews);
  res.status(200).json({
    status: 'Success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  const review = await Review.create(req.body);
  res.status(201).json({
    status: 'Success',
    data: {
      review,
    },
  });
});
