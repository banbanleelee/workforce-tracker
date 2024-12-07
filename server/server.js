// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const { updateTasksToCompleted, startTaskUpdater } = require('./jobs/taskUpdater');
const axios = require('axios');

const app = express();

// Enable CORS with appropriate settings
app.use(cors({
  origin: '*', // Allow frontend to access the backend 'https://workforce-tracker.vercel.app'
  optionSuccessStatus: 200, // For legacy browsers
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow necessary HTTP methods
  credentials: true // Authorization headers
}));

// Middleware
app.use(express.json());

// Health check route for keep-alive
app.get('/health', (req, res) => res.status(200).send('OK'));

// Database connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('MongoDB Connected');

    // Run task updater immediately on server start
    updateTasksToCompleted()
      .then(() => console.log('Task updater ran successfully on server start.'))
      .catch(err => console.error('Error running task updater on server start:', err));

    // Schedule task updater to run periodically
    startTaskUpdater();
  })
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

// Keep-alive script to prevent Render from spinning down
const keepAlive = () => {
  const serverUrl = process.env.SERVER_URL || `http://localhost:${PORT}/health`;

  setInterval(async () => {
    try {
      const response = await axios.get(serverUrl);
      console.log(`[${new Date().toISOString()}] Keep-alive ping successful: ${response.status}`);
    } catch (error) { // Use `error` instead of `err`
      console.error(`[${new Date().toISOString()}] Keep-alive ping failed: ${error.message}`);
    }
  }, 5 * 60 * 1000); // Ping every 5 minutes
};

keepAlive();