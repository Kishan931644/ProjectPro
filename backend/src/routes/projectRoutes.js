const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getUserProjects,
  editProject,
  deleteProject,
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .post(protect, authorize('admin', 'manager'), createProject)
  .get(protect, getProjects);

router.get('/user', protect, getUserProjects);

router.route('/:id')
  .put(protect, authorize('admin', 'manager'), editProject)
  .delete(protect, authorize('admin', 'manager'), deleteProject);

module.exports = router;
