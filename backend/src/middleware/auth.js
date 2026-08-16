const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Токен отсутствует' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;

    // 1. Разделяем ошибки валидации JWT и ошибки сервера/БД
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      return res.status(401).json({ success: false, message: 'Недействительный или просроченный токен' });
    }

    const user = await User.findById(decoded.id || decoded.userId)
      .select('-password -verificationCode -resetPasswordCode')
      .lean();

    // 2. Если пользователя нет в БД, это ошибка авторизации (401), а не 404
    if (!user) {
      return res.status(401).json({ success: false, message: 'Пользователь не найден или был удален' });
    }

    // 3. Проверка блокировки аккаунта (isBanned)
    if (user.isBanned) {
      // Если бан временный и срок вышел — пропускаем
      if (user.bannedUntil && new Date(user.bannedUntil) < new Date()) {
        // Можно автоматически снять бан в БД асинхронно
        User.findByIdAndUpdate(user._id, { isBanned: false, banReason: null, bannedUntil: null }).exec();
      } else {
        return res.status(403).json({
          success: false,
          message: `Аккаунт заблокирован. Причина: ${user.banReason || 'Не указана'}`
        });
      }
    }

    // 4. Нормализуем id
    req.user = {
      ...user,
      id: user._id.toString(),
    };

    next();
  } catch (error) {
    console.error('Protect Middleware Error:', error);
    return res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера при проверке доступа' });
  }
};

module.exports = { protect };