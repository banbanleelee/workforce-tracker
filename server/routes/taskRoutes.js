const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Ensure this path is correct
// const { Task } = require('../models/Task');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');

// Define the route to add a new task
router.post('/', verifyToken('teamMember'), async (req, res) => {
  console.log('Request received:', req.body); // To check if request is reaching here
  try {
    const { userId } = req.user; // Get user ID from the decoded token (using middleware)
    const { timeSpent, queue, completed = false, startDate, endDate } = req.body;

    console.log('Received request body:', req.body); // Log the request body

    // Find the user by ID
    console.log('Looking up user with ID:', userId);
    const user = await User.findById(userId);
    if (!user) {
      console.error('User not found with ID:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User found:', user);

    // Create the new task object
    const newTask = {
      taskId: uuidv4(), // Generate a unique task ID on the backend
      timeSpent,
      queue,
      completed,
      startDate: startDate ? new Date(startDate) : new Date(), // If provided, use startDate; otherwise use current time
      endDate: endDate ? new Date(endDate) : new Date(), // If provided, use endDate; otherwise use current time
    };

    // Add the new task to the user's `tasks` array
    user.tasks.push(newTask);

    console.log('Attempting to save user with new task...');
    await user.save(); // Save the updated user document with the new task added
    console.log('Task added successfully.');

    // Return the newly added task
    res.status(201).json({ message: 'Task added successfully', task: newTask });
  } catch (error) {
    console.error('Detailed error saving task:', error); // Log the exact error
    res.status(500).json({ error: 'Server Error', details: error.message });
  }
});


// Get today's task
router.get('/today', verifyToken('teamMember'), async (req, res) => {
  console.log('Fetching today\'s tasks...');
  try {
    const { userId } = req.user; // Get user ID from the decoded token (using middleware)
    const startOfDay = moment().startOf('day').toDate();
    const endOfDay = moment().endOf('day').toDate();

    // Find the user and their tasks
    const user = await User.findById(userId);
    if (!user) {
      console.error('User not found:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    // Filter tasks started today (local time)
    const todayTasks = user.tasks.filter(task => {
      const taskStartDate = new Date(task.startDate);
      return taskStartDate >= startOfDay && taskStartDate <= endOfDay;
    });

    res.status(200).json(todayTasks);
  } catch (error) {
    console.error('Error fetching today\'s tasks:', error);
    res.status(500).send('Server Error');
  }
});


// Update a task's status or details for the logged-in user
router.put('/:id', verifyToken('teamMember'), async (req, res) => {
  console.log('Request received:', req.body);  // Add this log to inspect the incoming request payload

  const { id } = req.params;
  const { completed, startDate, endDate } = req.body;  // Destructure `startDate` and `endDate` from request body
  const { userId } = req.user;

  try {
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      console.error('User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    // Find the task by ID within user's tasks
    const task = user.tasks.id(id);
    if (!task) {
      console.error('Task not found with ID:', id);
      return res.status(404).json({ error: 'Task not found' });
    }

    // Update the task's properties if provided
    if (typeof completed !== 'undefined') {
      console.log('Updating completed status:', completed);
      task.completed = completed;
    }

    if (startDate) {
      console.log('Updating start date:', startDate);
      task.startDate = new Date(startDate);  // Update `startDate` if provided in request
    }

    if (endDate) {
      console.log('Updating end date:', endDate);
      task.endDate = new Date(endDate);  // Update `endDate` if provided in request
    }

    // Save the updated user document with the modified task
    await user.save();
    console.log('Task updated successfully:', task);

    // Send the updated task back in the response
    res.status(200).json({ message: 'Task updated successfully', task });
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(400).json({ error: 'Error updating task', details: err.message });
  }
});

// Update a task's completion status or details, including startDate and endDate (Team Member View)
router.put('/complete/:taskId', verifyToken('teamMember'), async (req, res) => {
  const { taskId } = req.params;
  const { timeSpent, completed, startDate, endDate } = req.body;

  // Validate `timeSpent` if provided
  if (timeSpent && (typeof timeSpent !== 'number' || timeSpent < 0)) {
    return res.status(400).json({ error: 'Invalid timeSpent value' });
  }

  // Validate `completed` if provided
  if (typeof completed !== 'undefined' && typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'Invalid completed value' });
  }

  try {
    // Construct the update object based on provided fields
    const updateFields = {};
    
    if (typeof timeSpent === 'number') {
      updateFields['tasks.$.timeSpent'] = timeSpent;
    }

    if (typeof completed === 'boolean') {
      updateFields['tasks.$.completed'] = completed;
    }

    if (startDate) {
      updateFields['tasks.$.startDate'] = new Date(startDate);
    }

    if (endDate) {
      updateFields['tasks.$.endDate'] = new Date(endDate);
    }

    // Find the user and update the specific task
    const user = await User.findOneAndUpdate(
      { 'tasks.taskId': taskId },
      { $set: updateFields },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Find the updated task from the user object
    const updatedTask = user.tasks.find(task => task.taskId === taskId);

    res.status(200).json({ message: 'Task updated successfully', task: updatedTask });
  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({ error: 'Server Error', details: error.message });
  }
});

// Fetch current tasks of all team members (Admin view)
router.get('/current-tasks', verifyToken('admin'), async (req, res) => {
  try {
    const users = await User.find({ role: 'teamMember' });

    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'No team members found' });
    }

    const currentTasks = users.map((user) => {
      const activeTask = user.tasks.find(task => !task.completed); // Find the first incomplete task
      return {
        user: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        activeTask: activeTask || null,
      };
    });

    res.status(200).json(currentTasks);
  } catch (error) {
    console.error('Error fetching current tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tasks for a specific team member and date range (Admin View)
router.get('/tasks-by-team-member', verifyToken('admin'), async (req, res) => {
  const { startDate, endDate, userId } = req.query;

  try {
    // Validate query parameters
    if (!startDate || !endDate || !userId) {
      return res.status(400).json({ error: 'Please provide startDate, endDate, and userId.' });
    }

    const start = moment(startDate).startOf('day').toDate();
    const end = moment(endDate).endOf('day').toDate();

    // Find user by userId
    const user = await User.findById(userId).select('tasks firstName lastName email');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Filter user's tasks by date range
    const filteredTasks = user.tasks.filter(task => {
      const taskStart = new Date(task.startDate);
      const taskEnd = new Date(task.endDate);
      // Ensure either task's start date or end date falls within the range
      return (taskStart >= start && taskStart <= end) || (taskEnd >= start && taskEnd <= end);
    });

    res.status(200).json({
      teamMember: `${user.firstName} ${user.lastName}`,
      tasks: filteredTasks,
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Get all team members (Admin View)
router.get('/team-members', verifyToken('admin'), async (req, res) => {
  try {
    // Find all users with role 'teamMember'
    const teamMembers = await User.find({ role: 'teamMember' }).select('firstName lastName _id email');
    res.status(200).json(teamMembers);
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get tasks for all team members within a date range (Admin view)
router.get('/all-tasks-by-date', verifyToken('admin'), async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    // Validate query parameters
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Please provide startDate and endDate.' });
    }

    // Set start and end times for the query using moment
    const start = moment(startDate).startOf('day').toDate();
    const end = moment(endDate).endOf('day').toDate();

    // Find all users with role 'teamMember' and select relevant fields
    const users = await User.find({ role: 'teamMember' }).select('tasks firstName lastName email');

    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'No users found' });
    }

    // Collect tasks for all users within the date range
    const filteredTasks = users.flatMap(user => 
      user.tasks.filter(task => {
        const taskStart = new Date(task.startDate);
        const taskEnd = new Date(task.endDate);
        // Ensure either task's start date or end date falls within the range
        return (taskStart >= start && taskStart <= end) || (taskEnd >= start && taskEnd <= end);
      }).map(task => ({
          ...task.toObject(),
          _id: task._id,  // Include MongoDB ObjectId (_id)
          teamMember: `${user.firstName} ${user.lastName}`
        }))
    );

    res.status(200).json({
      tasks: filteredTasks,
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});


// Update a specific task by its MongoDB ObjectId (Admin View)
router.put('/update-task/:taskId', verifyToken('admin'), async (req, res) => {
  const { taskId } = req.params;
  const { startDate, endDate } = req.body;

  console.log('Received taskId:', taskId);
  console.log('Received data:', { startDate, endDate });

  try {
    // Ensure taskId is properly converted to ObjectId
    const objectIdTaskId = new mongoose.Types.ObjectId(taskId);

    // Find the user who has the task and update the specific task's fields
    const user = await User.findOne({ 'tasks._id': objectIdTaskId });

    if (!user) {
      console.log('No user found with that task ID:', taskId);
      return res.status(404).json({ error: 'Task not found' });
    }

    // Find and update the task in the user's tasks array
    const task = user.tasks.id(objectIdTaskId);
    if (!task) {
      console.log('No task found within user tasks:', taskId);
      return res.status(404).json({ error: 'Task not found in user tasks' });
    }

    // Update task fields
    if (startDate) task.startDate = new Date(startDate);
    if (endDate) task.endDate = new Date(endDate);

    // Optionally, recalculate timeSpent if both startDate and endDate are provided
    if (startDate && endDate) {
      task.timeSpent = Math.floor((new Date(endDate) - new Date(startDate)) / 1000);
    }

    // Save the updated user document
    await user.save();

    res.status(200).json({ message: 'Task updated successfully', task });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});


module.exports = router;
