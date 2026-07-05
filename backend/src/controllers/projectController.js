const Project = require('../models/Project');

// @desc    Create a project
// @route   POST /api/projects
// @access  Private (Admin/Manager usually)
const createProject = async (req, res) => {
  const { name, description, client, status } = req.body;

  try {
    const project = await Project.create({
      name,
      description,
      client,
      admin: req.user._id, // default to current user
      manager: req.user._id, // default to current user
      users: [],
      status: status || 'active',
      organization: req.user.organization,
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all projects for the user's organization
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ organization: req.user.organization })
      .populate('client', 'name')
      .populate('manager', 'name')
      .populate('admin', 'name');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get projects of the logged-in user
// @route   GET /api/projects/user
// @access  Private
const getUserProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      organization: req.user.organization,
      $or: [
        { admin: req.user._id },
        { manager: req.user._id },
        { users: req.user._id },
      ]
    })
      .populate('client', 'name')
      .populate('manager', 'name')
      .populate('admin', 'name');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Edit a project
// @route   PUT /api/projects/:id
// @access  Private
const editProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.organization.toString() !== req.user.organization.toString()) {
      return res.status(401).json({ message: 'Not authorized to edit this project' });
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.organization.toString() !== req.user.organization.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this project' });
    }

    await project.deleteOne();
    res.json({ message: 'Project removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProject,
  getProjects,
  getUserProjects,
  editProject,
  deleteProject,
};
