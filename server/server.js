// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Enable CORS with appropriate settings
app.use(cors({
  origin: 'https://workforce-tracker.vercel.app', // Allow frontend to access the backend
  optionSuccessStatus: 200, //For legacy browsers
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow necessary HTTP methods
  credentials: true // Authorization headers
}));

// Middleware
// app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Task Routes
const taskRoutes = require('./routes/taskRoutes');
app.use('/api/tasks', taskRoutes);

// Auth Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes); // Mount auth routes

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
