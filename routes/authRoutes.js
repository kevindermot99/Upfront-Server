// routes/authRoutes.js
const express = require('express');
const {
  login,
  signup,
  verifyEmail,
  verifyAnswer,
  newPassword
} = require('../controllers/authController');
const router = express.Router();

router.post('/login', login);
router.post('/signup', signup);
router.post('/verifyEmail', verifyEmail);
router.post('/verifyAnswer', verifyAnswer);
router.post('/newPassword', newPassword);

module.exports = router;
