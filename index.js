// server.js
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors({orgin: ["http://http://localhost:5173","https://upfront.onrender.com"]}));
app.use(express.json());
const port = 5000;

mongoose.connect(process.env.MONGODB_URI);

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  securityQ: String,
  securityQAnswer: String,
});

const User = mongoose.model("User", userSchema);

// Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User doesn't exist" });
    }
    if (await bcrypt.compare(password, user.password)) {
      return res.status(200).json({ msg: "Login successful" });
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
  const { username, email, password, securityQ, securityQAnswer } = req.body;

  try {
    if (await User.findOne({ email })) {
      return res.status(401).json({ msg: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedAnswer = await bcrypt.hash(securityQAnswer, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      securityQ,
      securityQAnswer: hashedAnswer,
    });
    await newUser.save();

    res.json({ msg: "User registered successfully" });
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

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
