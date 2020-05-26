const Tour = require('./../modules/tourModel');
const catchAsync = require('./../utils/');

exports.getAllTours = catchAsync(async (req, res, next) => {
  const features = new APIfeatures(Tour.find(), req.query)
    .filtered()
    .paginate()
    .limitFields()
    .sortBy();

  const tours = await features.query;
  res.status(200).json({
    status: 'Sucsess',
    data: {
      tours,
    },
  });
});
