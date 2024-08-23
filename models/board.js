const mongoose = require("mongoose");
// Define the user schema
const boardSchema = new mongoose.Schema({
  name: { type: String, required: false },
  projectId: { type: String, required: false },
  user_email: { type: String, required: false },
}, { timestamps: { createdAt: true, updatedAt: true } });
// Create the model
const Board = mongoose.model("board", boardSchema);
// Export the model
module.exports = Board;
