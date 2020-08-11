const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minlength: 5,
      maxlength: 20,
      require: [true, 'Insert a name'],
    },
    email: {
      type: String,
      unique: true,
      require: [true, 'Insert a email'],
      validate: [validator.isEmail, 'Provide email'],
    },
    roles: {
      type: [String],
      enum: {
        values: ['user', 'lead-guide', 'admin'],
        message: 'role must be user, lead-guide , admin',
      },
    },
    photo: String,
    password: {
      type: String,
      require: [true, 'Place a password'],
      select: false,
    },
    confirmPassword: {
      type: String,
      require: [true, 'Confirm the password'],
      validate: {
        validator: function (val) {
          return val === this.password;
        },
        message: 'The passwords match',
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordExpiresAt: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.pre(/ˆfind/, function (next) {
  this.find({ action: { $ne: true } });
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  password
) {
  return await bcrypt.compare(candidatePassword, password);
};

userSchema.methods.changedPassword = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000);
    return JWTTimestamp < changedTimestamp;
  }
};

userSchema.methods.createUserResetToken = function (next) {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .hash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordExpiresAt = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

userSchema.pre('save', function (next) {
  if (this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now();
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
