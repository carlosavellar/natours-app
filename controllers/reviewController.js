const Review = require('./../models/reviewsModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const APIfeatures = require('./../utils/APIfeatures');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const apiFeatures = new APIfeatures(Review.find(), req.params.id)
    .filtered()
    .sortBy()
    .limitFields()
    .paginate();

  const reviews = await apiFeatures.query;

  res.status(200).json({
    status: 'Success',
    data: {
      reviews,
    },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.params.id;
  if (req.body.user) new AppError('Users is missing', 401);
  const review = await Review.create(req.body);
  res.status(201).json({
    status: 'Success',
    data: {
      review,
    },
  });
});
