const Review = require('./../models/reviewModel.js');
const handleFactory = require('./handleFactory');

exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getReviews = handleFactory.getAll(Review);
exports.createReview = handleFactory.createOne(Review);
exports.deleteReview = handleFactory.deleteOne(Review);
exports.updateReview = handleFactory.updateOne(Review);
exports.getReview = handleFactory.getOne(Review);
