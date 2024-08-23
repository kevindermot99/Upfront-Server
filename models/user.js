const mongoose = require('mongoose');
// Define the user schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  securityQ: { type: String, required: true },
  securityQAnswer: { type: String, required: true },
});
// Create the model
const User = mongoose.model('User', userSchema);
// Export the model
module.exports = User;