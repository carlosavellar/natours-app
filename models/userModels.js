const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    validate: [validator.isEmail, 'Put a real email'],
    unique: true,
  },
  photo: String,
  password: {
    type: String,
    maxlength: 9,
    required: [true, 'Please Chooose a password'],
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, 'Confirm the password'],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'The passwords don´t match',
    },
  },
  passwordChangedAt: Date,
});

userSchema.pre(/^save/, async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

userSchema.methods.correctPassword = function (candidatePassword, password) {
  return bcrypt.compare(candidatePassword, password);
};

userSchema.methods.changedPassword = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const timeStemp = parseInt(this.passwordChangedAt.getTime() / 100);
    return JWTTimestamp < timeStemp;
  }
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
