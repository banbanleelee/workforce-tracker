const Task = require('../models/Task'); // Make sure you have the correct path for Task model

exports.createTask = async (req, res) => {
  try {
    const task = new Task(req.body); // Assuming req.body has the required task data
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
