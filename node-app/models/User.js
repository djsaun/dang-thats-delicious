const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise; // Also in start.js. Only included here to suppress error that displays in terminal
const md5 = require('md5');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');

// Create model
const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true, // always saves as lowercase
    trim: true,
    validate: [validator.isEmail, 'Invalid Email Address'], // first is validation method, second is validation error
    required: 'Please supply an email address.',
  },
  name: {
    type: String,
    required: 'Please supply a name.',
    trim: true
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  hearts: [
    { type: mongoose.Schema.ObjectId, ref: 'Store' } // hearts is an array of ids that are related to a store
  ]
});

// Create a virtual field to get gravatar
userSchema.virtual('gravatar').get(function() {
  // use md5 hashing algorithm to get gravatar
  const hash = md5(this.email);
  return `https://gravatar.com/avatar/${hash}?s=200`;
});

userSchema.plugin(passportLocalMongoose, { usernameField: 'email' }); // passportLocalMongoose takes care of adding additional fields and methods to Schema; Set username as email

userSchema.plugin(mongodbErrorHandler); // Change ugly errors into pretty errors

module.exports = mongoose.model('User', userSchema);
