const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./../utils/factory');

exports.getAllUsers = factory.getAll(User);

exports.getMe = factory.getOne(User);
