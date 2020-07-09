const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    validate: [validator.isEmail],
    unique: true,
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'Choose a password'],
  },
  confirmPassword: {
    type: String,
    required: [true, 'Confirm the password'],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'The passwords doesn`t match',
    },
  },
  passwordChangedAt: Date,
});

userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000);
    return JWTTimestamp < changedTimeStamp;
  }
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

userSchema.methods.correctPassword = function (candidatePassword, password) {
  return bcrypt.compare(candidatePassword, password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
