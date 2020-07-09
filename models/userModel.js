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
    type: Number,
    required: [true, 'Choose a password'],
  },
  confirmPassword: {
    type: Number,
    required: [true, 'Confirm the password'],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'The passwords doesn`t match',
    },
  },
});

userSchema.pre('save', function (next) {
  this.password = bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
