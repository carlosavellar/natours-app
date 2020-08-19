const Review = require('./../models/reviewsModel');
const factory = require('./factory');
const catchAsync = require('./../utils/catchAsync');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };

  //   const apiFeatures = new APIFeatures(Model.find(filter), req.query)
  //     .filtered()
  //     .paginate()
  //     .limitFields()
  //     .sortBy();

  const reviews = await Review.find(filter);
  res.status(200).json({
    status: 'Success',
    results: reviews.length,
    data: {
      data: reviews,
    },
  });
});

exports.createReview = factory.createOne(Review);

exports.getReview = factory.getOne(Review);

exports.getReview = factory.updateOne(Review);
