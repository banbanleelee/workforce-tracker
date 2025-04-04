const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const { updateTasksToCompleted, startTaskUpdater } = require('./jobs/taskUpdater');
const axios = require('axios');
const { startEmailScheduler } = require('./jobs/emailScheduler');
const { sendTestEmail } = require('./jobs/emailScheduler');

const app = express();

//Force all redirects to use HTTPS in server.js
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
  });
}


// Enable CORS with appropriate settings
const allowedOrigins = [
  'http://localhost:3000',
  'https://workforce-tracker.vercel.app',
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// Mounted nppes api route
const nppesRoutes = require('./routes/nppesRoutes');
app.use('/api/nppes', nppesRoutes);

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

    // Start the email scheduler
    startEmailScheduler();

    // Uncomment the following line to send a test email
    sendTestEmail();
  })
  .catch(err => console.log('MongoDB connection error:', err));

// Task Routes
const taskRoutes = require('./routes/taskRoutes');
app.use('/api/tasks', taskRoutes);

// Auth Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes); 

// FH Issue Referral Routes
const fhReferralRoutes = require('./routes/fhReferralRoutes');
app.use('/api/referrals', fhReferralRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Keep-alive script to prevent Render from spinning down
const keepAlive = () => {
  const serverUrl = 'https://workforce-tracker-backend.onrender.com/health'; 

  setInterval(async () => {
    const now = new Date();
    const currentHourEST = now.getUTCHours() - 5; 

    // Only send keep-alive pings between 6 AM and 7 PM EST
    if (currentHourEST >= 6 && currentHourEST < 19) {
      try {
        const response = await axios.get(serverUrl);
        console.log(`[${new Date().toISOString()}] Keep-alive ping successful: ${response.status}`);
      } catch (err) {
        console.error(`[${new Date().toISOString()}] Keep-alive ping failed: ${err.message}`);
      }
    } else {
      console.log(`[${new Date().toISOString()}] Outside active hours (6 AM - 7 PM EST). No ping sent.`);
    }
  }, 5 * 60 * 1000); // Check every 5 minutes
};

keepAlive();
