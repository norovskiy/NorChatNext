// Допуск для Admin и Owner
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Неавторизован' });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'owner') {
    return res.status(403).json({ 
      success: false, 
      message: 'Доступ запрещен: требуется роль Admin или Owner' 
    });
  }

  next();
};

// Допуск ТОЛЬКО для Owner (God Mode)
const requireOwner = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Неавторизован' });
  }

  if (req.user.role !== 'owner') {
    return res.status(403).json({ 
      success: false, 
      message: 'Доступ запрещен: действие доступно только Owner' 
    });
  }

  next();
};

module.exports = { requireAdmin, requireOwner };