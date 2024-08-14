
const mongoose = require('mongoose');

// Define the user schema
const workspaceSchema = new mongoose.Schema({
  workspace1: { type: String, required: true },
  workspace2: { type: String, required: true },
  workspace3: { type: String, required: true },
  user_email: { type: String, required: true },
});

// Create the model
const Workspace = mongoose.model('workspace', workspaceSchema);

// Export the model
module.exports = Workspace;