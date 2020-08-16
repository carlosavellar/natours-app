const Review = require('./../models/reviewsModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const APIfeatures = require('./../utils/APIfeatures');
const factory = require('./../utils/factory');

exports.getAllReviews = factory.getAll(Review);

exports.createReview = factory.createOne(Review);

exports.getReview = factory.getOne(Review);
