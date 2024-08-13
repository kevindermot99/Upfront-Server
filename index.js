// index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(express.json());

const port = 5000;
app.use(cors({
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/api/users', userRoutes);
app.use('/api', authRoutes);

app.get('/', (req, res) => {
  res.json({ msg: "Hello World" });
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});


app.use(errorHandler);