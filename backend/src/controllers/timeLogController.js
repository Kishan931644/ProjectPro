const TimeLog = require('../models/TimeLog');
const Task = require('../models/Task');
const Project = require('../models/Project');

// Helper to check if task belongs to user's organization
const isTaskInUserOrg = async (taskId, userOrgId) => {
  const task = await Task.findById(taskId).populate('project');
  if (!task || task.project.organization.toString() !== userOrgId.toString()) {
    return false;
  }
  return true;
};

// @desc    Add a timelog
// @route   POST /api/timelogs
// @access  Private
const addTimeLog = async (req, res) => {
  const { task, time, date } = req.body;

  try {
    const isValid = await isTaskInUserOrg(task, req.user.organization);
    if (!isValid) {
      return res.status(404).json({ message: 'Task not found or not authorized' });
    }

    const timeLog = await TimeLog.create({
      task,
      time,
      date: date || Date.now(),
      loggedBy: req.user._id,
    });

    res.status(201).json(timeLog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get timelogs for a task
// @route   GET /api/timelogs/task/:taskId
// @access  Private
const getTimeLogsForTask = async (req, res) => {
  try {
    const isValid = await isTaskInUserOrg(req.params.taskId, req.user.organization);
    if (!isValid) {
      return res.status(404).json({ message: 'Task not found or not authorized' });
    }

    const timeLogs = await TimeLog.find({ task: req.params.taskId })
      .populate('loggedBy', 'name email');

    res.json(timeLogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Edit a timelog
// @route   PUT /api/timelogs/:id
// @access  Private
const editTimeLog = async (req, res) => {
  try {
    let timeLog = await TimeLog.findById(req.params.id);

    if (!timeLog) {
      return res.status(404).json({ message: 'TimeLog not found' });
    }

    // Role Guard: If user role is 'user', they can only edit their own time log
    if (req.user.role === 'user' && timeLog.loggedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this time log' });
    }

    // Still need to verify it belongs to their org (admins/managers could theoretically access other orgs if we aren't careful)
    const isValid = await isTaskInUserOrg(timeLog.task, req.user.organization);
    if (!isValid) {
      return res.status(401).json({ message: 'Not authorized for this organization' });
    }

    timeLog = await TimeLog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json(timeLog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a timelog
// @route   DELETE /api/timelogs/:id
// @access  Private
const deleteTimeLog = async (req, res) => {
  try {
    const timeLog = await TimeLog.findById(req.params.id);

    if (!timeLog) {
      return res.status(404).json({ message: 'TimeLog not found' });
    }

    // Role Guard: If user role is 'user', they can only delete their own time log
    if (req.user.role === 'user' && timeLog.loggedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this time log' });
    }

    const isValid = await isTaskInUserOrg(timeLog.task, req.user.organization);
    if (!isValid) {
      return res.status(401).json({ message: 'Not authorized for this organization' });
    }

    await timeLog.deleteOne();
    res.json({ message: 'TimeLog removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addTimeLog,
  getTimeLogsForTask,
  editTimeLog,
  deleteTimeLog,
};
