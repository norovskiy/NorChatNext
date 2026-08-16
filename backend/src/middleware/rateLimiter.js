const rateLimit = require('express-rate-limit');

// строгий лимит для операций с кодами (брутфорс-чувствительные)
const codeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Слишком много попыток, попробуйте позже' }
});

// более мягкий лимит для логина
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Слишком много попыток входа, попробуйте позже' }
});

module.exports = { codeLimiter, loginLimiter };