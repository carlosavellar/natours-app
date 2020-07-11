const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
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
  role: {
    type: 'String',
    enum: {
      values: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user',
    },
  },
  password: {
    type: String,
    required: [true, 'Choose a password'],
    select: false,
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
  passwordResetToken: String,
  passwordExpires: Date,
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

userSchema.methods.createPasswordResetToken = () => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
