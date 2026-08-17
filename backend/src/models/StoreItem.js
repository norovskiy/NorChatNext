import mongoose from 'mongoose';

const storeItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['frame', 'background', 'subscription', 'gift', 'avatar'], 
      required: true 
    },
    rarity: { 
      type: String, 
      enum: ['common', 'epic', 'legendary', 'vip'], 
      default: 'common' 
    },
    price: { type: Number, required: true },
    assetUrl: { type: String, default: '' },
    frameClass: { type: String, default: '' }, // CSS-классы градиентов/анимаций для рамок
    planKey: { type: String, enum: ['plus', 'vip', 'premium', null], default: null }, // Для подписок
    stackable: { type: Boolean, default: false }, // Для подарков (можно покупать многократно)
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('StoreItem', storeItemSchema);