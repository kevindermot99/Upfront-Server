// server.js
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
const port = 5000;

mongoose.connect(process.env.MONGODB_URI);

const User = mongoose.model("users", {
  username: String,
  email: String,
  password: String,
});

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
  } catch {
    res.status(500).json({ msg: "Server error" });
  }
});

app.post("/api/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (await User.findOne({ email })) {
      return res.status(401).json({ msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.json({ msg: "User registered successfully" });
  } catch {
    res.status(500).json({ msg: "Server error" });
  }
});


app.get("/api/verify", async (req, res) => {
  const { email } = req.query;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ msg: "User doesn't exist" });
  }

  res.status(200).json({ user });
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

