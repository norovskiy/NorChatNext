const mongoose = require('mongoose');
const StoreItem = require('../models/StoreItem');
const InventoryItem = require('../models/Inventory');
const User = require('../models/User');

// Безопасная проверка валидности MongoDB ObjectId
const isValidId = (id) => id && mongoose.Types.ObjectId.isValid(id);

// Проверка активности VIP/Premium подписок
const isVipActive = (user) => {
  if (!user?.subscription) return false;
  const { plan, expiresAt } = user.subscription;
  return (plan === 'vip' || plan === 'premium') && new Date(expiresAt) > new Date();
};

const isPremiumActive = (user) => {
  if (!user?.subscription) return false;
  const { plan, expiresAt } = user.subscription;
  return plan === 'premium' && new Date(expiresAt) > new Date();
};

// GET /api/store/items — Каталог товаров
const getStoreItems = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { isActive: true };
    if (type) filter.type = type;

    const items = await StoreItem.find(filter).sort({ price: 1 });
    return res.json({ success: true, items });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Ошибка сервера при получении товаров' });
  }
};

// POST /api/store/purchase — Покупка товара
const purchaseItem = async (req, res) => {
  const { itemId, idempotencyKey } = req.body;

  if (!itemId || !isValidId(itemId)) {
    return res.status(400).json({ success: false, message: 'Некорректный ID товара' });
  }

  if (!idempotencyKey) {
    return res.status(400).json({ success: false, message: 'Ключ идемпотентности (idempotencyKey) обязателен' });
  }

  const userId = req.user.id || req.user._id;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const item = await StoreItem.findById(itemId).session(session);
    if (!item || item.isActive === false) throw new Error('Товар не найден или снят с продажи');

    const user = await User.findById(userId).select('+norCoins +subscription').session(session);
    if (!user) throw new Error('Пользователь не найден');

    // Проверка VIP / Premium требований
    if (item.requiresVip && !isVipActive(user)) throw new Error('Для покупки требуется активный VIP');
    if (item.requiresPremium && !isPremiumActive(user)) throw new Error('Для покупки требуется активный Premium');

    // Проверка нестакаемых предметов
    if (!item.stackable && item.type !== 'subscription') {
      const owned = await InventoryItem.findOne({ userId: user._id, itemId }).session(session);
      if (owned) throw new Error('Этот предмет уже у вас есть');
    }

    // Проверка баланса
    if (user.norCoins < item.price) throw new Error('Недостаточно NorCoins');

    user.norCoins -= item.price;

    // Оформление подписки
    if (item.type === 'subscription') {
      user.subscription = {
        plan: item.planKey || 'plus',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 дней
      };
    }

    await user.save({ session });

    let newInventoryItem = null;
    if (item.type !== 'subscription') {
      [newInventoryItem] = await InventoryItem.create([{
        userId: user._id,
        itemId,
        stackable: item.stackable,
        acquiredVia: 'purchase',
      }], { session });
    }

    await session.commitTransaction();
    return res.json({ 
      success: true, 
      message: 'Покупка успешно совершена',
      inventoryItem: newInventoryItem, 
      newBalance: user.norCoins,
      user
    });

  } catch (err) {
    await session.abortTransaction();
    return res.status(400).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
};

// POST /api/store/equip — Экипировка предметов
const equipItem = async (req, res) => {
  try {
    const { itemId, inventoryItemId } = req.body;
    const targetId = itemId || inventoryItemId;
    const userId = req.user.id || req.user._id;

    if (!targetId || !isValidId(targetId)) {
      return res.status(400).json({ success: false, message: 'Передан некорректный ID предмета' });
    }

    const owned = await InventoryItem.findOne({
      userId,
      $or: [{ itemId: targetId }, { _id: targetId }]
    }).populate('itemId');

    if (!owned) return res.status(403).json({ success: false, message: 'У вас нет этого предмета' });

    const item = owned.itemId;
    const user = await User.findById(userId).select('+subscription');

    if (item.requiresVip && !isVipActive(user)) {
      return res.status(403).json({ success: false, message: 'Срок действия вашего VIP истек' });
    }
    if (item.requiresPremium && !isPremiumActive(user)) {
      return res.status(403).json({ success: false, message: 'Срок действия вашего Premium истек' });
    }

    const willEquip = !owned.equipped;

    if (willEquip) {
      const sameTypeItems = await InventoryItem.find({ userId }).populate('itemId');
      const targetIds = sameTypeItems
        .filter(i => i.itemId && i.itemId.type === item.type)
        .map(i => i._id);

      await InventoryItem.updateMany(
        { _id: { $in: targetIds } },
        { $set: { equipped: false } }
      );
    }

    owned.equipped = willEquip;
    await owned.save();

    // Обновление атрибутов профиля
    const updateField = item.type === 'frame' ? 'avatarFrame' : item.type === 'background' ? 'banner' : null;
    if (updateField) {
      const valueToSet = willEquip ? (item.frameClass || item.assetUrl) : '';
      await User.findByIdAndUpdate(userId, { [updateField]: valueToSet });
      user[updateField] = valueToSet;
    }

    return res.json({ 
      success: true, 
      message: willEquip ? 'Предмет экипирован' : 'Предмет снят', 
      user 
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/store/inventory — Инвентарь
const getUserInventory = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const inventory = await InventoryItem.find({ userId }).populate('itemId');
    return res.json({ success: true, inventory });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Ошибка при загрузке инвентаря' });
  }
};

// POST /api/store/gift — Отправка подарков
const sendGift = async (req, res) => {
  const { toUserId, recipientId, itemId, idempotencyKey } = req.body;
  const targetRecipient = toUserId || recipientId;
  const senderId = req.user.id || req.user._id;

  if (!idempotencyKey) {
    return res.status(400).json({ success: false, message: 'idempotencyKey обязателен' });
  }
  if (!itemId || !isValidId(itemId)) {
    return res.status(400).json({ success: false, message: 'Некорректный ID подарка' });
  }
  if (targetRecipient === String(senderId)) {
    return res.status(400).json({ success: false, message: 'Нельзя дарить подарки самому себе' });
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const item = await StoreItem.findById(itemId).session(session);
    if (!item || item.isActive === false) throw new Error('Подарок не найден');

    const sender = await User.findById(senderId).select('+norCoins').session(session);
    const recipient = await User.findOne({
      $or: [
        { _id: isValidId(targetRecipient) ? targetRecipient : null },
        { username: targetRecipient }
      ]
    }).session(session);

    if (!recipient) throw new Error('Получатель не найден');
    if (sender.norCoins < item.price) throw new Error('Недостаточно NorCoins');

    sender.norCoins -= item.price;
    await sender.save({ session });

    await InventoryItem.create([{
      userId: recipient._id,
      itemId,
      stackable: item.stackable,
      acquiredVia: 'gift',
      acquiredFrom: sender._id,
    }], { session });

    await session.commitTransaction();
    return res.json({ success: true, message: 'Подарок успешно отправлен', newBalance: sender.norCoins });

  } catch (err) {
    await session.abortTransaction();
    return res.status(400).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
};

module.exports = {
  getStoreItems,
  purchaseItem,
  equipItem,
  getUserInventory,
  sendGift,
};