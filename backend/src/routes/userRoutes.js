const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { getMe, updateProfile, equipFrame } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Защита от частой смены профиля (максимум 15 обновлений за 15 минут)
const profileUpdateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { error: 'Слишком частые обновления профиля. Подождите немного.' }
});

router.get('/me', protect, getMe);
router.put('/profile', protect, profileUpdateLimiter, updateProfile);
router.put('/equip-frame', protect, equipFrame);

module.exports = router;