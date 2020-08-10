const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

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
    photo: String,
    password: {
      type: String,
      require: [true, 'Place a password'],
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
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

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
  const changedTimestamp = parseInt(this.passwordChangedAt).getTime() / 1000;
  return JWTTimestamp < changedTimestamp;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
