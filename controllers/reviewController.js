const Review = require('./../models/reviewsModel');
const { catchAsync } = require('./../utils/catchAsync');

exports.getAllReviews = async (req, res, next) => {
  const review = await Review.find();
  res.status(200).json({
    status: 'Success',
    review,
  });
};

exports.createReview = async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.params.id;
  const review = await Review.create(req.body);
  res.status(200).json({
    status: 'Success',
    review,
  });
};

exports.getAllTourReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.tourId) filter = req.params.tourId;
  const reviews = await Review.find(filter);
  res.status(200).json({
    status: 'Success',
    reviews,
  });
});
