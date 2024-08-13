// controllers/authController.js
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User doesn't exist" });
    if (await bcrypt.compare(password, user.password)) {
      return res.status(200).json({ msg: "Login successful" });
    } else {
      return res.status(401).json({ msg: "Incorrect Password" });
    }
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

exports.signup = async (req, res) => {
  const { username, email, password, securityQ, securityQAnswer } = req.body;

  try {
    if (await User.findOne({ email })) return res.status(401).json({ msg: "User already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedAnswer = await bcrypt.hash(securityQAnswer, 10);
    const newUser = new User({ username, email, password: hashedPassword, securityQ, securityQAnswer: hashedAnswer });
    await newUser.save();
    res.json({ msg: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

exports.verifyEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "No account found !" });
    return res.status(200).json({ question: user.securityQ });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

exports.verifyAnswer = async (req, res) => {
  const { email, answer } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "No account found !" });
    if (await bcrypt.compare(answer, user.securityQAnswer)) {
      return res.status(200).json({ msg: "Answer correct !" });
    } else {
      return res.status(400).json({ msg: "Incorrect Answer" });
    }
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

exports.newPassword = async (req, res) => {
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
};
