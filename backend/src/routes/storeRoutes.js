const express = require('express');
const router = express.Router();
const { 
  getStoreItems, 
  purchaseItem, 
  equipItem, 
  getUserInventory,
  sendGift
} = require('../controllers/storeController');

// Обрати внимание на правильные имена файлов middleware и rateLimiter
const { purchaseLimiter, giftLimiter } = require('../middleware/rateLimiter');
const { protect } = require('../middleware/auth');

router.get('/items', getStoreItems);
router.post('/purchase', protect, purchaseLimiter, purchaseItem);
router.post('/equip', protect, equipItem);
router.get('/inventory', protect, getUserInventory);
router.post('/gift', protect, giftLimiter, sendGift);

module.exports = router;