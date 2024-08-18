const mongoose = require("mongoose");


// Define the user schema
const trashProjectSchema = new mongoose.Schema({
  name: { type: String, required: false },
  desc: { type: String, required: false },
  user_email: { type: String, required: false },
  workspace: { type: String, required: false },
  curentStatus: { type: String, required: false },
  collaborations: [{ type: String, required: false, match: /.+\@.+\..+/ }]
}, { timestamps: { createdAt: true, updatedAt: false } });

// Create the model
const TrashProject = mongoose.model("trashProject", trashProjectSchema);

// Export the model
module.exports = TrashProject;
