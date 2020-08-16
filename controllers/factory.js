const AppError = require('./appError');
const catchAsync = require('./catchAsync');
const APIFeatures = require('./APIfeatures');

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) {
      filter = { tour: req.params.tourId };
    }
    const apiFeatures = new APIFeatures(Model.find(filter), req.query)
      .filtered()
      .paginate()
      .limitFields()
      .sortBy();

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
    console.log(req.params.id);
    const tour = await Model.findById(req.params.id).populate({
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

exports.deleteOne = (Model) =>
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
