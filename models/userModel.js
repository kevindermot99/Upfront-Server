// models/userModel.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  securityQ: String,
  securityQAnswer: String,
});

module.exports = mongoose.model('User', userSchema);
