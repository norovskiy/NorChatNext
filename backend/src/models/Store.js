const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true }, // 'frame', 'background', etc.
  price: { type: Number, required: true },
  active: { type: Boolean, default: true },
  stackable: { type: Boolean, default: false },
  requiresVip: { type: Boolean, default: false },
  requiresPremium: { type: Boolean, default: false },
  assetUrl: String,
});

const inventoryItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  equipped: { type: Boolean, default: false },
  stackable: { type: Boolean, default: false },
  acquiredVia: { type: String, enum: ['purchase', 'gift'], default: 'purchase' },
  acquiredFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
  amount: { type: Number, required: true },
  balanceBefore: Number,
  balanceAfter: Number,
  idempotencyKey: { type: String, required: true, unique: true },
  status: { type: String, default: 'completed' },
}, { timestamps: true });

module.exports = {
  Item: mongoose.model('Item', itemSchema),
  InventoryItem: mongoose.model('InventoryItem', inventoryItemSchema),
  Transaction: mongoose.model('Transaction', transactionSchema),
};