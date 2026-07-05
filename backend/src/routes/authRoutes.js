const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  googleLogin,
  inviteUser,
  getInviteDetails,
  acceptInvite,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.post('/invite', protect, authorize('admin', 'manager'), inviteUser);
router.get('/invite/:token', getInviteDetails);
router.post('/accept-invite', acceptInvite);

module.exports = router;
