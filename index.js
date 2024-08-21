// server.js
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();
const User = require("./models/user");
const Workspace = require("./models/workspaces");
const Project = require("./models/project");
const TrashProject = require("./models/trashProject");
const Board = require("./models/board");

const app = express();
app.use(express.json());
const port = 5000;
const corsOptions = {
  origin: ["https://upfront.onrender.com", "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));

mongoose.connect(process.env.MONGODB_URI);

// Hello
app.get("/", async (req, res) => {
  try {
    res.json({ msg: "Hello World" });
  } catch (error) {
    res.json({ msg: "Server error" });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User doesn't exist" });
    }
    if (await bcrypt.compare(password, user.password)) {
      const spaces = await Workspace.findOne({ user_email: email });
      return res.status(200).json({
        luemail: user.email,
        luname: user.username,
        luw1: spaces.workspace1,
      });
    } else {
      return res.status(401).json({ msg: "Incorrect Password" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Sign up
app.post("/api/signup", async (req, res) => {
  const { userName, email, password, securityQ, securityQAnswer } = req.body;

  try {
    if (await User.findOne({ email })) {
      return res.status(401).json({ msg: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedAnswer = await bcrypt.hash(securityQAnswer, 10);
    const newUser = new User({
      username: userName,
      email,
      password: hashedPassword,
      securityQ,
      securityQAnswer: hashedAnswer,
    });
    await newUser.save();
    const newWorkSpace = new Workspace({
      workspace1: "Workspace 1",
      user_email: email,
    });
    await newWorkSpace.save();

    res.status(200).json({
      luemail: email,
      luname: userName,
      luw1: "Workspace 1",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});

// forgotPassword
app.post("/api/verifyEmail", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "No account found !" });
    }
    return res.status(200).json({ question: user.securityQ });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});
app.post("/api/verifyAnswer", async (req, res) => {
  const { email, answer } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "No account found !" });
    }
    if (await bcrypt.compare(answer, user.securityQAnswer)) {
      return res.status(200).json({ msg: "Answer correct !" });
    } else {
      return res.status(400).json({ msg: "Incorrect Answer" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});
app.post("/api/newPassword", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ msg: "User not found" });

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    res.status(200).json({ msg: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Update workspace1
app.patch("/api/updateWorkspace1", async (req, res) => {
  const { w1, userEmail } = req.body;
  try {
    const result = await Workspace.findOneAndUpdate(
      { user_email: userEmail },
      { workspace1: w1 },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    res.status(200).json(result);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating workspace", error: err.message });
  }
});

// get users workspaces
app.get("/api/workspaces", async (req, res) => {
  const { userEmail } = req.query;
  try {
    const user = await User.findOne({ email: userEmail });
    if (!user) return res.status(401).json({ msg: "User not found" });

    const space = await Workspace.findOne({ user_email: userEmail });
    res.json({
      dbw1: space.workspace1,
    });
  } catch (error) {
    res.json({ msg: "Server error", error: error });
  }
});

// get users
app.get("/api/getusers", async (req, res) => {
  try {
    const users = await User.find().select("email _id");
    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch users", error: error.message });
  }
});

// get me
app.get("/api/getme", async (req, res) => {
  const { email } = req.query;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({ msg: " hehehe! get out" });
    }
    res.status(200).json({ msg: "Okay, you're good to go" });
  } catch (error) {
    res.status(401).json({ msg: "Server error" });
  }
});

// get my projects
app.get("/api/getmyprojects", async (req, res) => {
  const { email } = req.query;
  try {
    const user = await User.findOne({ email: email });
    if (!user) return res.status(401).json({ msg: "User not found" });

    const projects = await Project.find({ user_email: email });
    res.status(200).json({ projects: projects });
  } catch (error) {
    res.status(400).json({ msg: "Server error", error: error });
  }
});

// create project
app.post("/api/createProject", async (req, res) => {
  const { name, desc, userEmail, workspace, collaborations } = req.body; // Added collaborations
  try {
    // Find the workspace by userEmail
    const workspaceDoc = await Workspace.findOne({ user_email: userEmail });

    if (!workspaceDoc) {
      return res
        .status(404)
        .json({ error: "Workspace not found for the given user email." });
    }
    let workspaceId;

    if (workspace === "w1") {
      workspaceId = workspaceDoc._id;
    } else {
      return res.status(400).json({ error: "Invalid workspace identifier." });
    }

    // Create the new project with the provided data
    const newProject = await new Project({
      name,
      desc,
      user_email: userEmail,
      workspace: workspaceId,
      curentStatus: "active",
      collaborations, // Added the collaborations array
    }).save();

    res.status(200).json({
      id: newProject._id,
      workspace: newProject.workspace,
      createdAt: newProject.createdAt,
    }); // Return createdAt
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "Error creating project.", details: error.message });
  }
});

// get Project data
app.get("/api/getproject", async (req, res) => {
  const id = req.query.id;
  const userEmail = req.query.userEmail;
  try {
    if (!id || !userEmail) {
      return res.status(401).json({ msg: "Empty params" });
    }
    const user = await User.findOne({ email: userEmail });
    if (!user) return res.status(401).json({ msg: "User not found" });

    const project = await Project.findOne({ _id: id, user_email: userEmail });
    if (!project) return res.status(401).json({ msg: "Project not found" });
    res.status(200).json(project);
  } catch (error) {
    res.status(400).json({ msg: "Server error", error: error });
  }
});

// add collaborator
app.post("/api/addcollaborator", async (req, res) => {
  const { id, email } = req.body;

  try {
    // Find the project by ID
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ msg: "Project not found" });

    // Check if the email is already in the collaborations array
    if (project.collaborations.includes(email)) {
      return res.status(400).json({ msg: "User already a collaborator" });
    }

    // Add the new collaborator to the collaborations array
    project.collaborations.push(email);
    await project.save();

    res.status(200).json({
      newCollaborators: project.collaborations,
      msg: "Collaborator added successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});

// remove collaborator
app.post("/api/removecollaborator", async (req, res) => {
  const { id, email } = req.body;

  try {
    // Find the project by ID
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ msg: "Project not found" });

    // Check if the email is in the collaborations array
    if (!project.collaborations.includes(email)) {
      return res.status(400).json({ msg: "User is not a collaborator" });
    }

    // Remove the collaborator from the collaborations array
    project.collaborations = project.collaborations.filter(
      (collab) => collab !== email
    );
    await project.save();

    res.status(200).json({
      newCollaborators: project.collaborations,
      msg: "Collaborator removed successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get my collaborations
app.get("/api/getcollaborations", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ msg: "Email is required" });
  }

  try {
    const projects = await Project.find({
      collaborations: email,
      user_email: { $ne: email },
    }).select("name _id user_email");
    res.status(200).json({ projects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Update project
app.patch("/api/updateprojectdetails", async (req, res) => {
  const { newTitle, newDesc, projectid, userEmail } = req.body;
  try {
    const project = await Project.findOneAndUpdate(
      { _id: projectid, user_email: userEmail },
      { name: newTitle, desc: newDesc },
      { new: true } // Return the updated document
    );

    if (!project)
      return res.status(404).json({ message: "ndaq Project not found" });

    res.status(200).json({ name: project.name, desc: project.desc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// delete project
app.post("/api/movetotrash", async (req, res) => {
  const { projectId, userEmail } = req.body;
  try {
    const project = await Project.findOne({
      _id: projectId,
      user_email: userEmail,
    });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Create the new project with the provided data
    const trashedProject = await new TrashProject({
      _id: project._id,
      name: project.name,
      desc: project.desc,
      user_email: project.user_email,
      workspace: project.workspace,
      curentStatus: project.curentStatus,
      collaborations: project.collaborations,
    }).save();

    // delete the data in project model
    await Project.deleteOne({
      _id: projectId,
      user_email: userEmail,
    });
    return res.status(200).json({ message: "Project moved to trash" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// create board
app.post("/api/newboard", async (req, res) => {
  const { newBoardValue, projectId, userEmail } = req.body; // Added collaborations
  try {
    // Find the workspace by userEmail
    const project = await Project.findOne({
      _id: projectId,
      user_email: userEmail,
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found." });
    }

    // Create the new project with the provided data
    const newBoard = await new Board({
      name: newBoardValue,
      projectId: projectId,
      user_email: userEmail,
    }).save();

    res.status(200).json({
      id: newBoard._id,
      name: newBoard.name,
    });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "Error creating project.", details: error.message });
  }
});

// get my boards
app.get("/api/getboards", async (req, res) => {
  const { projectId, email } = req.query;
  try {
    const project = await Project.findOne({ user_email: email });
    if (!project) return res.status(401).json({ msg: "project not found" });

    const boards = await Board.find({ projectId: projectId, user_email: email });
    // Map over boards to extract the id and name
    const boardData = boards.map(board => ({
      id: board._id,
      name: board.name,
    }));

    res.status(200).json(boardData);
  } catch (error) {
    res.status(400).json({ msg: "Server error", error: error });
  }
});

// create Task
app.post("/api/newtask", async (req, res) => {
  const { newBoardValue, projectId, userEmail } = req.body; // Added collaborations
  try {
    // Find the workspace by userEmail
    const project = await Project.findOne({
      _id: projectId,
      user_email: userEmail,
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found." });
    }

    // Create the new project with the provided data
    const newBoard = await new Board({
      name: newBoardValue,
      projectId: projectId,
      user_email: userEmail,
    }).save();

    res.status(200).json({
      id: newBoard._id,
      name: newBoard.name,
    });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "Error creating project.", details: error.message });
  }
});


app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
