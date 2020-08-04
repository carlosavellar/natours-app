const { catchAsync } = require('./catchAsync');
const APIFeatrures = require('./APIfeatures');
const AppError = require('./AppError');

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const apiFeatures = new APIFeatrures(Model.find(), req.query);
    const doc = await apiFeatures.query.explain();
    res.status(200).json({
      status: 'Success',
      results: doc.length,
      data: {
        doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newTour = await Model.create(req.body);
    res.status(201).json({
      status: 'Success',
      data: {
        tour: newTour,
      },
    });
  });

exports.getOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const tour = await Model.findById(req.params.id).populate('reviews');

    if (!tour) {
      return next(new AppError('Tour not found, error 404', 404));
    }
    res.status(200).json({
      status: 'Success',
      data: {
        tour,
      },
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const tour = await Model.findByIdAndUpdate(req.params.id, req.body);
    if (!tour) return next(new AppError('Tour not found, error 404', 404));
    res.status(201).json({
      status: 'Success',
      data: {
        tour,
      },
    });
  });

exports.deletOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const tour = await Model.findByIdAndDelete(req.params.id);
    if (!tour) return next(new AppError('Tour not found, error 404', 404));
    res.status(204).json({
      status: 'Success',
      data: {
        tour,
      },
    });
  });
