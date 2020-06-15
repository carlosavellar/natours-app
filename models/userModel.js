const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    validate: [validator.isEmail, 'This sis not an email'],
  },
  photo: String,
  password: {
    type: String,
  },
  confirmPassword: {
    type: String,
    validade: {
      validator: function (val) {
        return this.password === val;
      },
      message: 'The passwords don´t match',
    },
  },
  passwordChangedAt: Date,
});

userSchema.pre('save', function (next) {
  this.password = bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

userSchema.methods.correctPassword = function (candidatePassword, password) {
  return bcrypt.compare(candidatePassword, password);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (passwordChangedAt) {
    const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000);
    return JWTTimestamp < changedTimeStamp;
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User;
