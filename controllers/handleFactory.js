const catchAsync = require('./../utils/catchAsync');
const APIFeatures = require('./../utils/APIFeatures');
const AppError = require('./../utils/appError');

exports.getAll = (Model) => {
  return catchAsync(async (req, res, next) => {
    const apiFeatures = new APIFeatures(Model.find(), req.query)
      .filtered()
      .paginate()
      .limitFields()
      .sortBy();
    const docs = await apiFeatures.query;
    res.status(200).json({
      status: 'Success',
      results: docs.length,
      data: {
        docs,
      },
    });
  });
};

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(200).json({
      status: 'Success',
      data: {
        doc,
      },
    });
  });

exports.createOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);
    res.status(201).json({
      status: 'Success',
      data: {
        doc: newDoc,
      },
    });
  });
};

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const query = Model.findByIdAndUpdate(req.params.id, req.body);

    const doc = await query;

    if (!doc) return next(new AppError('No review with this ID', 404));
    res.status(201).json({
      status: 'Success',
      data: {
        doc,
      },
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    console.log(doc);
    if (!doc) return next(new AppError('Not found, error 404', 404));
    res.status(204).json({
      status: 'Success',
      doc: null,
    });
  });
