const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getTaskById,
  editTask,
  deleteTask,
  getTaskStatuses,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

router.route('/')
  .post(protect, createTask)
  .get(protect, getTasks);

router.get('/statuses', protect, getTaskStatuses);

router.route('/:id')
  .get(protect, getTaskById)
  .put(protect, editTask)
  .delete(protect, deleteTask);

module.exports = router;
