const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  googleAuth,
  getMe,
  updateProfile
} = require('../controllers/authController');

// ========== ПУБЛИЧНЫЕ МАРШРУТЫ ==========
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);

// ========== ЗАЩИЩЁННЫЕ МАРШРУТЫ ==========
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;