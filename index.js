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
        luw1: spaces.workspace1.name,
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

// get me
app.get("/api/getme", async (req, res) => {
  const { email } = req.query;
  try {
    const user = await User.findOne({ email: email }); // Fetch all users
    if (!user) {
      return res.status(401).json({ msg: " hehehe! get out" });
    }
    res.status(200).json({msg: "Okay, you're good to go"});
  } catch (error) {
    res.status(401).json({ msg: "Server error" });
  }
});

// create project
app.post("/api/createProject", async (req, res) => {
  const { name, desc, userEmail, workspace } = req.body;
  try {
    // Find the workspace by userEmail
    const workspaceDoc = await Workspace.findOne({ user_email: userEmail });

    if (!workspaceDoc) {
      return res
        .status(404)
        .json({ error: "Workspace not found for the given user email." });
    }
    let workspaceName;

    if (workspace === "w1") {
      workspaceName = workspaceDoc.workspace1;
    } else {
      return res.status(400).json({ error: "Invalid workspace identifier." });
    }

    const newProject = await new Project({
      name,
      desc,
      user_email: userEmail,
      workspace: workspaceName,
    }).save();

    res
      .status(200)
      .json({ id: newProject._id, workspace: newProject.workspace });
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

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
