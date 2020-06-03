const Tour = require('./../models/tourModels');
const { catchAsync } = require('./../utils/catchAsync');
const APIfeatures = require('./../utils/APIfeatures');
const AppError = require('./../utils/AppError');
exports.getTopTours = (req, res, next) => {
  req.query.fields = 'name, price, duration, ratingsAverage';
  req.query.limit = 5;
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  const features = new APIfeatures(Tour.find(), req.query)
    .filtered()
    .sortBy()
    .paginate()
    .limitFields();

  const tours = await features.query;
  res.status(200).json({
    status: 'Sucsess',
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.create(req.body);
  res.status(201).json({
    status: 'Created',
    data: {
      tour,
    },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  if (!tour) new AppError('No tour found with this ID', 404);

  res.status(200).json({
    status: 'Success',
    data: {
      tour,
    },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true,
  });
  res.status(201).json({
    status: 'Success updated',
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const tour = await Tour.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: 'Success deleted',
    data: {
      tour,
    },
  });
});

exports.getStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 1 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        avgPrice: { $avg: '$price' },
        maxPrice: { $max: '$price' },
        mainPrice: { $min: '$price' },
      },
    },
  ]);
  res.status(200).json({
    status: 'Success',
    results: stats.length,
    data: {
      stats,
    },
  });
});

exports.getMonthStats = catchAsync(async (req, res, next) => {
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
        _id: { $month: '$startDates' },
        numberStats: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);
  res.status(200).json({
    status: 'Success',
    data: {
      plan,
    },
  });
});
