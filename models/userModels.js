const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Set a name'],
  },
  email: {
    type: String,
    required: [true, 'Set a email'],
    unique: true,
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'guide', 'lead-guide', 'admin'],
      message: 'The role must be: user, lead-guide, admin',
    },
    default: 'user',
  },
  photo: String,

  password: {
    type: String,
    required: [true, 'Need a password'],
    minlength: 6,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Vem password'],
    validate: {
      validator: function (el) {
        return this.password === el;
      },
      message: 'The passwords don`t match',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpiration: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  console.log(this.password);
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  password
) {
  return bcrypt.compare(candidatePassword, password);
};

userSchema.methods.passwordChangedAfter = function (JWTTimestamp) {
  let passTimeStamp = Date;
  if (this.passwordChangedAt) {
    passTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
  }

  return passTimeStamp < JWTTimestamp;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpiration = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
});

const User = mongoose.model('User', userSchema);

module.exports = User;
