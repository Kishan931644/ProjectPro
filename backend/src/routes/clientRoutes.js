const express = require('express');
const router = express.Router();
const {
  createClient,
  getClients,
  editClient,
  deleteClient,
} = require('../controllers/clientController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .post(protect, authorize('admin'), createClient)
  .get(protect, getClients); // all users can get clients

router.route('/:id')
  .put(protect, authorize('admin'), editClient)
  .delete(protect, authorize('admin'), deleteClient);

module.exports = router;
