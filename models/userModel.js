const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    // validate: [validator.isAlpha, 'Must be only leters'],
    minlength: 5,
    maxlength: 17,
  },
  email: {
    type: String,
    validate: [validator.isEmail, 'Please, provide an email!'],
    unique: true,
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'Provide a passowrd'],
  },
  confirmPassword: {
    type: String,
    require: [true, 'Confirm the password'],
    validade: {
      validator: function (val) {
        return val === this.password;
      },
      value: 'The passowrds is not the same!',
    },
  },
  passwordChangedAt: Date,
});

userSchema.pre('save', async function (next) {
  if (this.isModifyed) return next();
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
    const passwordTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000);
    return JWTTimestamp < passwordTimestamp;
  }
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
