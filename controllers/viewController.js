const catchAsync = require('./../utils/catchAsync');
const Tour = require('./../models/tourModel');
const AppError = require('./../utils/appError');
exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  // res.render('view', { debug: true });
  res.status(200).render('overview', {
    title: 'Isso aqui é overview',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  if (!tour) {
    return next(new AppError('There is no tour with this name', 404));
  }
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.getLoginForm = (req, res) => {
  // const { email, password } = req.body;
  // console.log(email, password);
  console.log(req.headers['user-agent']);
  res.status(200).render('login', {
    title: 'Login Into your account',
  });
};
