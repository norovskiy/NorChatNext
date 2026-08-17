const cron = require('node-cron');
const User = require('../models/User');
const { InventoryItem } = require('../models/Store');

const initVipCleanupJob = () => {
  cron.schedule('0 * * * *', async () => {
    try {
      const expiredUsers = await User.find({
        'subscription.expiresAt': { $lt: new Date() },
      }).select('_id');

      if (!expiredUsers.length) return;

      const userIds = expiredUsers.map(u => u._id);
      const equippedVipItems = await InventoryItem.find({
        userId: { $in: userIds },
        equipped: true,
      }).populate('itemId');

      const itemsToUnequip = equippedVipItems.filter(inv => inv.itemId && inv.itemId.requiresVip);

      for (const invItem of itemsToUnequip) {
        invItem.equipped = false;
        await invItem.save();

        const fieldToReset = invItem.itemId.type === 'frame' ? { avatarFrame: '' } : invItem.itemId.type === 'background' ? { banner: '' } : {};
        await User.findByIdAndUpdate(invItem.userId, fieldToReset);
      }
    } catch (err) {
      console.error('Ошибка при сбросе VIP рамок:', err);
    }
  });
};

module.exports = { initVipCleanupJob };