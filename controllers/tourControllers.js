const Tour = require('./../models/tourModels');
const { catchAsync } = require('./../utils/catchAsync');
const APIfeatures = require('./../utils/APIfeatures');

exports.getAllTours = catchAsync(async (req, res, next) => {
  const features = new APIfeatures(Tour.find(), req.query).filtered();

  const tours = await features.query;
  res.status(200).json({
    status: 'Sucsess',
    data: {
      tours,
    },
  });
});
