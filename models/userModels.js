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
    validate: [validator.isEmail, 'Put a real email'],
    unique: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  photo: String,
  password: {
    type: String,
  },
  confirmPassword: {
    type: String,
    validate: {
      validator: function (val) {
        return val === this.password;
      },
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetSpires: Date,
});

userSchema.pre('save', async function (next) {
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.correctPassword = async function (
  condidatePassword,
  password
) {
  if (this.password) {
    return await bcrypt.compare(condidatePassword, password);
  }
};

userSchema.methods.createPassowrdReset = function () {
  const reseToken = crypto.rondomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha-256')
    .update(reseToken)
    .digest('hex');
  this.passwordResetSpires = Date.now() + 10 * 60 * 1000;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
