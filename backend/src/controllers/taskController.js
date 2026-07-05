const Task = require('../models/Task');
const Project = require('../models/Project');
const TaskStatus = require('../models/TaskStatus');

// @desc    Get all available task statuses
// @route   GET /api/tasks/statuses
// @access  Private
const getTaskStatuses = async (req, res) => {
  try {
    const statuses = await TaskStatus.find().sort('createdAt');
    res.json(statuses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  const { title, description, project, assignee, status, startDate, dueDate, priority } = req.body;

  try {
    // Verify project belongs to the user's organization
    const projectExists = await Project.findById(project);
    if (!projectExists || projectExists.organization.toString() !== req.user.organization.toString()) {
      return res.status(404).json({ message: 'Project not found or not authorized' });
    }

    const task = await Task.create({
      title,
      description,
      project,
      assignee,
      status,
      startDate,
      dueDate,
      priority,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { projectId } = req.query;
    
    // We should ideally filter by organization. We can do this by finding all projects in the org,
    // and then finding tasks for those projects.
    const projects = await Project.find({ organization: req.user.organization }).select('_id');
    const projectIds = projects.map(p => p._id);

    let query = { project: { $in: projectIds } };
    
    if (projectId) {
      if (!projectIds.some(id => id.toString() === projectId)) {
        return res.status(401).json({ message: 'Not authorized for this project' });
      }
      query.project = projectId;
    }

    const tasks = await Task.find(query)
      .populate('project', 'name')
      .populate('assignee', 'name')
      .populate('status', 'name');
      
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a particular task
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name organization')
      .populate('assignee', 'name')
      .populate('status', 'name');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.project.organization.toString() !== req.user.organization.toString()) {
      return res.status(401).json({ message: 'Not authorized to view this task' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Edit a task
// @route   PUT /api/tasks/:id
// @access  Private
const editTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id).populate('project');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.project.organization.toString() !== req.user.organization.toString()) {
      return res.status(401).json({ message: 'Not authorized to edit this task' });
    }

    // Don't allow changing the project here directly without re-verifying organization
    const updateData = { ...req.body };
    delete updateData.project; // Simplify for now

    task = await Task.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.project.organization.toString() !== req.user.organization.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this task' });
    }

    await task.deleteOne();
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  editTask,
  deleteTask,
  getTaskStatuses,
};
