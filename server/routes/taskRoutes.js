const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Ensure this path is correct
// const { Task } = require('../models/Task');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');

// Define the route to add a new task
router.post('/', verifyToken('teamMember'), async (req, res) => {
  console.log('Request received:', req.body);
  try {
    const { userId } = req.user; // Get user ID from the decoded token (using middleware)
    const { queue, timeSpent, completed = false } = req.body;

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
    };

    // Add the new task to the user's `tasks` array
    user.tasks.push(newTask);

    console.log('Attempting to save user with new task...');
    await user.save(); // Save the updated user document with the new task added
    console.log('Task added successfully.');

    // Return the newly added task
    res.status(201).json({ message: 'Task added successfully', task: newTask });
  } catch (error) {
    console.error('Detailed error saving task:', error);
    res.status(500).json({ error: 'Server Error', details: error.message });
  }
});


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

    // Filter tasks created today
    const todayTasks = user.tasks.filter(task => {
      const taskCreatedAt = new Date(task.createdAt);
      return taskCreatedAt >= startOfDay && taskCreatedAt <= endOfDay;
    });

    res.status(200).json(todayTasks);
  } catch (error) {
    console.error('Error fetching today\'s tasks:', error);
    res.status(500).send('Server Error');
  }
});

// Update a task's status or details for the logged-in user
router.put('/:id', verifyToken, async (req, res) => {
  console.log('Request received:', req.body);  // Add this log to inspect the incoming request payload

  const { id } = req.params;
  const { completed } = req.body;
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


router.put('/complete/:taskId', verifyToken('teamMember'), async (req, res) => {
  const { taskId } = req.params;
  const { timeSpent, completed } = req.body;

  if (!timeSpent || typeof timeSpent !== 'number' || timeSpent < 0) {
    return res.status(400).json({ error: 'Invalid timeSpent value' });
  }

  if (typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'Invalid completed value' });
  }

  try {
    // Find the user and update the task with the given taskId
    const user = await User.findOneAndUpdate(
      { 'tasks.taskId': taskId },
      { 
        $set: {
          'tasks.$.timeSpent': timeSpent,
          'tasks.$.completed': completed,
        }
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Find the updated task from the user object
    const updatedTask = user.tasks.find(task => task.taskId === taskId);

    res.status(200).json({ message: 'Task completed successfully', task: updatedTask });
  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({ error: 'Server Error', details: error.message });
  }
});

router.get('/', verifyToken('teamMember'), async (req, res) => {
  const { userId } = req.user; // User ID from the decoded token
  const { startDate, endDate } = req.query;

  try {
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Extract tasks from user
    let tasks = user.tasks;

    // Filter tasks by date range if provided
    if (startDate && endDate) {
      const start = moment(startDate).startOf('day').toDate();
      const end = moment(endDate).endOf('day').toDate();

      tasks = tasks.filter((task) => {
        const taskDate = new Date(task.createdAt);
        return taskDate >= start && taskDate <= end;
      });
    }

    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
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

// Get tasks for specific team member and date range (Admin View)
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
      return task.createdAt >= start && task.createdAt <= end;
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

    const start = moment(startDate).startOf('day').toDate();
    const end = moment(endDate).endOf('day').toDate();

    // Find all users with role 'teamMember'
    const users = await User.find({ role: 'teamMember' }).select('tasks firstName lastName email');

    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'No users found' });
    }

    // Collect tasks for all users within the date range
    const filteredTasks = users.flatMap(user => 
      user.tasks.filter(task => task.createdAt >= start && task.createdAt <= end)
        .map(task => ({
          ...task.toObject(),
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



module.exports = router;
