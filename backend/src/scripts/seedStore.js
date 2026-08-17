import mongoose from 'mongoose';
import StoreItem from '../models/StoreItem.js';

const INITIAL_ITEMS = [
  // --- Подписки ---
  {
    name: 'Подписка PLUS',
    type: 'subscription',
    planKey: 'plus',
    rarity: 'common',
    price: 1000,
    isActive: true,
  },
  {
    name: 'Подписка VIP',
    type: 'subscription',
    planKey: 'vip',
    rarity: 'vip',
    price: 2500,
    isActive: true,
  },
  {
    name: 'Подписка PREMIUM',
    type: 'subscription',
    planKey: 'premium',
    rarity: 'legendary',
    price: 5000,
    isActive: true,
  },

  // --- Рамки ---
  {
    name: 'Золотое сияние',
    type: 'frame',
    rarity: 'legendary',
    price: 500,
    frameClass: 'from-amber-400 via-orange-500 to-yellow-300',
    assetUrl: '/assets/store/frame-gold.png',
  },
  {
    name: 'Неоновый кибер',
    type: 'frame',
    rarity: 'epic',
    price: 300,
    frameClass: 'from-cyan-500 via-blue-500 to-indigo-500',
    assetUrl: '/assets/store/frame-neon.png',
  },

  // --- Фоны ---
  {
    name: 'Ночной город',
    type: 'background',
    rarity: 'legendary',
    price: 800,
    assetUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600',
  },

  // --- Подарки ---
  {
    name: 'Алая роза',
    type: 'gift',
    rarity: 'common',
    price: 50,
    stackable: true,
    assetUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200',
  },
  {
    name: 'Спортивный карамболь',
    type: 'gift',
    rarity: 'legendary',
    price: 2000,
    stackable: true,
    assetUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=200',
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Подключено к MongoDB...');

    // Очищаем существующие товары и загружаем актуальные
    await StoreItem.deleteMany({});
    const created = await StoreItem.insertMany(INITIAL_ITEMS);

    console.log(`Успешно добавлено товаров: ${created.length}`);
    process.exit(0);
  } catch (err) {
    console.error('Ошибка сидирования:', err);
    process.exit(1);
  }
}

seed();