const mongoose = require('mongoose');
const schedule = require('node-schedule');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const logWithTimestamp = (message) => console.log(`[${new Date().toISOString()}] ${message}`);

// const connectToDatabase = async () => {
//   try {
//     logWithTimestamp('Connecting to MongoDB...');
//     await mongoose.connect(process.env.MONGO_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       connectTimeoutMS: 30000,
//       socketTimeoutMS: 45000,
//     });
//     logWithTimestamp('Connected to MongoDB.');
//   } catch (err) {
//     logWithTimestamp(`Error connecting to MongoDB: ${err}`);
//     process.exit(1);
//   }
// };

const updateTasksToCompleted = async () => {
  try {
    logWithTimestamp('Running scheduled task updater...');
    const users = await User.find();
    logWithTimestamp(`Found ${users.length} users in the database.`);

    for (const user of users) {
      let userUpdated = false;

      user.tasks.forEach((task) => {
        const taskStartDate = new Date(task.startDate);
        const endOfDay = new Date(taskStartDate);
        endOfDay.setHours(17, 0, 0, 0);

        if (!task.endDate || new Date(task.endDate).toDateString() !== taskStartDate.toDateString()) {
          task.endDate = endOfDay;
          logWithTimestamp(`  Task ${task.taskId}: Adjusting endDate to ${task.endDate}`);
          userUpdated = true;
        }

        const now = new Date();
        if (!task.completed && now >= endOfDay) {
          task.completed = true;
          logWithTimestamp(`  Task ${task.taskId}: Marked as completed.`);
          userUpdated = true;
        }
      });

      if (userUpdated) {
        await user.save({ validateModifiedOnly: true });
        logWithTimestamp(`Updated tasks for user: ${user.firstName} ${user.lastName} (${user._id})`);
      } else {
        logWithTimestamp(`No updates required for user: ${user.firstName} ${user.lastName}`);
      }
    }

    logWithTimestamp('Tasks updated successfully.');
  } catch (err) {
    logWithTimestamp(`Error updating tasks: ${err}`);
  }
};

const startTaskUpdater = () => {
  logWithTimestamp('Initializing task updater...');
  schedule.scheduleJob('0 0 * * *', updateTasksToCompleted); // Adjusted to midnight daily
  logWithTimestamp('Task updater job scheduled to run at midnight daily.');
};

// This is for testing only
// const startApp = async () => {
//   await connectToDatabase();
//   await updateTasksToCompleted();
//   startTaskUpdater();
// };

// startApp().catch((err) => {
//   logWithTimestamp(`Error starting app: ${err}`);
// });
module.exports = { updateTasksToCompleted, startTaskUpdater };