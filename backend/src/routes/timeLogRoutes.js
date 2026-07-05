const express = require('express');
const router = express.Router();
const {
  addTimeLog,
  getTimeLogsForTask,
  editTimeLog,
  deleteTimeLog,
} = require('../controllers/timeLogController');
const { protect } = require('../middleware/auth');

router.post('/', protect, addTimeLog);
router.get('/task/:taskId', protect, getTimeLogsForTask);

router.route('/:id')
  .put(protect, editTimeLog)
  .delete(protect, deleteTimeLog);

module.exports = router;
