const Tour = require('./../models/tourModels');
const { catchAsync } = require('./../utils/catchAsync');
const APIfeatures = require('./../utils/APIfeatures');

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
  const tour = Tour.create(req.body);
  res.status(201).json({
    status: 'Created',
    data: {
      tour,
    },
  });
});
