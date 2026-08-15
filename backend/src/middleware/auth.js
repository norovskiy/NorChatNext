const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Токен отсутствует' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id || decoded.userId)
      .select('-password')
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, message: 'Пользователь не найден' });
    }

    // 🔑 Нормализуем id, чтобы везде в контроллерах были доступны и ._id, и .id
    req.user = {
      ...user,
      id: user._id.toString(),
    };

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Недействительный токен' });
  }
};

module.exports = { protect };