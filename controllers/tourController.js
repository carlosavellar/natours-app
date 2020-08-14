const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/APIfeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');
const User = require('./../models/userModel');

exports.getAllTours = catchAsync(async (req, res, next) => {
  const apiFeatures = new APIFeatures(Tour.find(), req.query)
    .filtered()
    .paginate()
    .limitFields()
    .sortBy();
  const tours = await apiFeatures.query;
  res.status(200).json({
    status: 'Success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'Success',
    data: {
      tour: newTour,
    },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  console.log(req.params.id);
  const tour = await Tour.findById(req.params.id).populate({
    path: 'guides',
    select: '-__v -passwordChgangedAt',
  });
  if (!tour) {
    console.log('eeee');
    return next(new AppError('Tour not found, error 404', 404));
  }
  res.status(200).json({
    status: 'Success',
    data: {
      tour,
    },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body);
  if (!tour) return next(new AppError('Tour not found, error 404', 404));
  res.status(201).json({
    status: 'Success',
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) return next(new AppError('Tour not found, error 404', 404));
  res.status(204).json({
    status: 'Success',
    data: {
      tour,
    },
  });
});

exports.getStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 1 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
  ]);
  res.status(200).json({
    status: 'Success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { month: 'startDates' },
        total: { $sum: 1 },
        tour: { $push: '$name' },
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $sort: {
        numTourStats: -1,
      },
    },
    {
      $limit: 3,
    },
  ]);
  res.status(200).json({
    status: 'Success',
    data: {
      plan,
    },
  });
});
