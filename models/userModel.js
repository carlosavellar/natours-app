const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const CryptoJS = require('crypto-js');
const userSchema = new mongoose.Schema({
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
    lowercase: true,
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'Choose a password'],
    select: false,
  },
  confirmPassword: {
    type: String,
    // required: [true, 'Confirme the password'],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      value: 'Password doens´t maatch',
    },
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  // this.password = await CryptoJS.AES.encrypt(
  //   this.password,
  //   '12 secret key'
  // ).toString(' ');
  this.confirmPassword = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const Users = mongoose.model('Users', userSchema);

module.exports = Users;
