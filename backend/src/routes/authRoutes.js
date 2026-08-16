const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

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

// Middleware для обработки ошибок валидации
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array().map(err => ({ field: err.path, message: err.msg })) 
    });
  }
  next();
};

// Защита от брутфорса для авторизации и сброса (макс 10 попыток за 15 минут)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Слишком много попыток. Пожалуйста, повторите через 15 минут.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Мягкий лимит для публичных действий
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30
});

// --- Публичные маршруты ---

// Регистрация
router.post(
  '/register',
  authLimiter,
  [
    body('email').isEmail().withMessage('Укажите корректный email').normalizeEmail(),
    body('username')
      .trim()
      .isLength({ min: 3, max: 16 }).withMessage('Имя пользователя должно быть от 3 до 16 символов')
      .matches(/^[a-zA-Z0-9_.]+$/).withMessage('Допустимы только латинские буквы, цифры, _ и .'),
    body('password').optional().isLength({ min: 6 }).withMessage('Пароль должен быть не менее 6 символов'),
    validate
  ],
  register
);

// Подтверждение кода регистрации
router.post(
  '/verify-registration',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('code').trim().notEmpty().withMessage('Укажите проверочный код'),
    validate
  ],
  verifyRegistrationCode
);

// Авторизация
router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Некорректный email').normalizeEmail(),
    body('password').notEmpty().withMessage('Введите пароль'),
    validate
  ],
  login
);

// Вход через Google
router.post('/google', generalLimiter, googleAuth);

// Запрос сброса пароля
router.post(
  '/forgot-password',
  authLimiter,
  [
    body('email').isEmail().withMessage('Укажите корректный email').normalizeEmail(),
    validate
  ],
  forgotPassword
);

// Сброс пароля по коду
router.post(
  '/reset-password',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('code').trim().notEmpty().withMessage('Укажите код сброса'),
    body('newPassword').isLength({ min: 6 }).withMessage('Новый пароль должен быть не менее 6 символов'),
    validate
  ],
  resetPassword
);

// --- Защищенные маршруты ---

router.get('/me', protect, getMe);

router.put(
  '/profile',
  protect,
  [
    body('nickname').optional().trim().isLength({ min: 2, max: 25 }).withMessage('Никнейм от 2 до 25 символов'),
    body('bio').optional().trim().isLength({ max: 160 }).withMessage('Описание не более 160 символов'),
    validate
  ],
  updateProfile
);

module.exports = router;