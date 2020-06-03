const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlengh: 16,
    minlength: 5,
  },
  email: {
    type: String,
    required: [true, 'Please put an email'],
    unique: true,
    validate: [validator.isEmail, 'Put a real email'],
  },
  photo: {
    type: String,
  },
  password: {
    type: Number,
    required: [true, 'Choose a password'],
    select: false,
  },
  confirmPassword: {
    type: Number,
    // required: [true, 'Confirme the password'],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      value: 'Password doens´t maatch',
    },
  },
});

userSchema.pre('save', function (next) {
  if (this.isModified('password')) return next();
  this.password = bcryptjs.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  password
) {
  return bcryptjs.compare(candidatePassword, password);
};

const Users = mongoose.model('Users', userSchema);

module.exports = Users;
