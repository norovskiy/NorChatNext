const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  register,
  verifyRegistrationCode,
  login,
  googleAuth,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

router.post('/register', register);
router.post('/verify-registration', verifyRegistrationCode);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;