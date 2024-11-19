const mongoose = require('mongoose');

// Define Task Schema
const taskSchema = new mongoose.Schema({
  taskId: {
    type: String,
    required: true,
    default: () => uuidv4(), // Generate a unique ID for each task
    unique: true,
  },
  timeSpent: {
    type: Number,
    required: true,
  },
  queue: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
    default: '',
  },
  completed: {
    type: Boolean,
    default: false, // When a task is created, it is not completed yet
  },
  startDate: {
    type: Date, // New field to explicitly track the start date (including time) of the task
  },
  endDate: {
    type: Date, // New field to explicitly track the end date (including time) of the task
  },
}, { timestamps: true });


// Define User Schema
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['teamMember', 'admin'], default: 'teamMember' },
  tasks: { type: [taskSchema], default: [] } // Array of tasks linked to the user
});

const User = mongoose.model('User', userSchema);
module.exports = User;
