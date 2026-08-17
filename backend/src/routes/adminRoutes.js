const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { requireAdmin, requireOwner } = require('../middleware/roleAuth');

const {
  searchUsers,
  banUser,
  unbanUser,
  giveNorCoins,
  grantSubscription,
  deleteUser
} = require('../controllers/adminController');

router.use(protect);

router.get('/users/search', requireAdmin, searchUsers);
router.post('/users/ban', requireAdmin, banUser);
router.post('/users/unban', requireAdmin, unbanUser);
router.post('/users/coins', requireAdmin, giveNorCoins);

router.post('/users/subscription', requireOwner, grantSubscription);
router.delete('/users/:userId', requireOwner, deleteUser);

module.exports = router;