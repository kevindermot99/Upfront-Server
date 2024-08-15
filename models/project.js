const mongoose = require("mongoose");

// Define the user schema
const projectSchema = new mongoose.Schema({
  emoji: { type: String, required: true },
  name: { type: String, required: true },
  desc: { type: String, required: true }, // Removed unique constraint
  user_email: { type: String, required: true },
});

// Create the model
const Project = mongoose.model("project", projectSchema);

// Export the model
module.exports = Project;
