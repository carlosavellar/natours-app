const Tour = require('./../models/tourModel');
const factory = require('./../utils/factory');
const APIFeatures = require('./../utils/APIfeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');
const User = require('./../models/userModel');

exports.getAllTours = factory.getAll(Tour);

exports.createTour = factory.createOne(Tour);

exports.getTour = factory.getOne(Tour);

exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

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
