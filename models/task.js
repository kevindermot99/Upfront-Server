const mongoose = require("mongoose");


// Define the user schema
const taskSchema = new mongoose.Schema({
  name: { type: String, required: false },
  startingOn: { type: String, required: false },
  due: { type: String, required: false },
  priority: { type: String, required: false },
  boardId: { type: String, required: false },
  curentStatus: { type: String, required: false },
  projectId: { type: String, required: false },
  user_email: { type: String, required: false, match: /.+\@.+\..+/  },
  assignedTo: [{ type: String, required: false, match: /.+\@.+\..+/ }]
}, { timestamps: { createdAt: true, updatedAt: true } });

// Create the model
const Task = mongoose.model("task", taskSchema);

// Export the model
module.exports = Task;
