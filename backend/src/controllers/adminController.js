const User = require('../models/User');
const mongoose = require('mongoose');

exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || !query.trim()) {
      const defaultUsers = await User.find()
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(30);
      return res.json(defaultUsers);
    }

    const cleanQuery = query.trim();
    const safeRegex = cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const searchConditions = [
      { username: { $regex: safeRegex, $options: 'i' } },
      { email: { $regex: safeRegex, $options: 'i' } },
      { nickname: { $regex: safeRegex, $options: 'i' } }
    ];

    if (mongoose.Types.ObjectId.isValid(cleanQuery)) {
      searchConditions.push({ _id: cleanQuery });
    }

    const users = await User.find({ $or: searchConditions })
      .select('-password')
      .limit(30);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера при поиске', error: error.message });
  }
};

exports.banUser = async (req, res) => {
  try {
    const { userId, reason, bannedUntil } = req.body;
    const isOwner = req.user.role === 'owner';

    if (!userId) {
      return res.status(400).json({ message: 'Укажите ID пользователя' });
    }

    if (req.user._id.toString() === userId.toString()) {
      return res.status(400).json({ message: 'Нельзя заблокировать самого себя' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) return res.status(404).json({ message: 'Пользователь не найден' });

    if (targetUser.role === 'owner') {
      return res.status(403).json({ message: 'Нельзя заблокировать Владельца (Owner)' });
    }

    if (!isOwner && targetUser.role === 'admin') {
      return res.status(403).json({ message: 'Admin не может заблокировать другого Admin' });
    }

    if (!isOwner && (!reason || reason.trim().length === 0)) {
      return res.status(400).json({ message: 'Admin обязан указать причину блокировки' });
    }

    targetUser.isBanned = true;
    targetUser.banReason = reason || 'Заблокирован администрацией';
    targetUser.bannedUntil = bannedUntil ? new Date(bannedUntil) : null;
    await targetUser.save();

    res.json({ message: `Пользователь ${targetUser.username} успешно заблокирован`, user: targetUser });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при блокировке', error: error.message });
  }
};

exports.unbanUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const isOwner = req.user.role === 'owner';

    if (!userId) {
      return res.status(400).json({ message: 'Укажите ID пользователя для разблокировки' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) return res.status(404).json({ message: 'Пользователь не найден' });

    if (targetUser.role === 'owner') {
      return res.status(403).json({ message: 'Статус Владельца не подлежит изменению' });
    }

    if (!isOwner && targetUser.role === 'admin') {
      return res.status(403).json({ message: 'Недостаточно прав для разблокировки Администратора' });
    }

    if (!targetUser.isBanned) {
      return res.status(400).json({ message: 'Пользователь не заблокирован' });
    }

    targetUser.isBanned = false;
    targetUser.banReason = null;
    targetUser.bannedUntil = null;
    await targetUser.save();

    res.json({ 
      message: `Пользователь ${targetUser.username} успешно разблокирован`, 
      user: targetUser 
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при разблокировке', error: error.message });
  }
};

exports.giveNorCoins = async (req, res) => {
  try {
    const { userId, amount } = req.body;
    const isOwner = req.user.role === 'owner';
    const coinAmount = Number(amount);

    if (isNaN(coinAmount) || coinAmount <= 0) {
      return res.status(400).json({ message: 'Укажите корректное количество NorCoins' });
    }

    if (!isOwner && coinAmount > 10000) {
      return res.status(403).json({ message: 'Лимит выдачи за раз для Admin: 10,000 NorCoins' });
    }

    const targetUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { norCoins: coinAmount } },
      { new: true }
    );

    if (!targetUser) return res.status(404).json({ message: 'Пользователь не найден' });

    res.json({ 
      message: `Успешно начислено ${coinAmount} NorCoins пользователю ${targetUser.username}`, 
      newBalance: targetUser.norCoins 
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при начислении NorCoins', error: error.message });
  }
};

exports.grantSubscription = async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Доступ запрещен: выдавать подписки может только Owner' });
    }

    const { userId, plan, durationDays } = req.body;
    
    if (!['PLUS', 'VIP', 'PREMIUM', 'FREE'].includes(plan)) {
      return res.status(400).json({ message: 'Некорректный тип подписки' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) return res.status(404).json({ message: 'Пользователь не найден' });

    let expiresAt = null;
    if (plan !== 'FREE') {
      const days = Number(durationDays) || 30;
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days);
    }

    targetUser.subscription = plan;
    targetUser.subscriptionExpires = expiresAt;
    await targetUser.save();

    const notificationMessage = {
      type: 'SYSTEM_SUBSCRIPTION_GIFT',
      title: 'Поздравляем с новой подпиской! 🎉',
      body: `Владелец проекта (Owner) подарил вам подписку status: ${plan}!`,
      expiresAt: expiresAt
    };

    const io = req.app.get('socketio');
    if (io) {
      io.to(userId.toString()).emit('notification', notificationMessage);
    }

    res.json({
      message: `Подписка ${plan} успешно выдана пользователю ${targetUser.username}`,
      subscription: targetUser.subscription,
      expiresAt: targetUser.subscriptionExpires
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при выдаче подписки', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Доступ запрещен: удалять аккаунты может только Owner' });
    }

    const { userId } = req.params;

    const targetUser = await User.findById(userId);
    if (!targetUser) return res.status(404).json({ message: 'Пользователь не найден' });

    if (targetUser.role === 'owner') {
      return res.status(403).json({ message: 'Нельзя удалить аккаунт Владельца (Owner)' });
    }

    await User.findByIdAndDelete(userId);

    res.json({ message: `Профиль ${targetUser.username} безвозвратно удален из БД` });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при удалении профиля', error: error.message });
  }
};