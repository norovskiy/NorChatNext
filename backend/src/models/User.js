const mongoose = require('mongoose');

const frameSchema = new mongoose.Schema({
  frameId: { type: String, required: true },
  name: { type: String, required: true },
  borderClass: { type: String, required: true },
  animationClass: { type: String, default: '' },
  isAnimated: { type: Boolean, default: false }
}, { _id: false });

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: false,
    select: false // Безопасность: не возвращать хэш пароля в обычных запросах
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 16,
    match: /^[a-zA-Z0-9_.]+$/
  },
  nickname: {
    type: String,
    required: false,
    trim: true,
    minlength: 2,
    maxlength: 25
  },
  bio: {
    type: String,
    maxlength: 160,
    default: ''
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: 'male'
  },
  birthDate: {
    type: Date,
    default: null
  },
  region: {
    type: String,
    default: 'International'
  },

  // Аватарка, Анимация и Модерация
  avatar: {
    type: String,
    default: 'https://ui-avatars.com/api/?background=667ea&color=fff&size=128'
  },
  isAnimatedAvatar: {
    type: Boolean,
    default: false
  },
  avatarStatus: {
    type: String,
    enum: ['approved', 'pending_review', 'rejected'],
    default: 'approved'
  },

  // Активная рамка профиля
  equippedFrame: {
    type: frameSchema,
    default: () => ({
      frameId: 'frame_default_orange',
      name: 'NorChat Flame',
      borderClass: 'border-2 border-orange-500 shadow-[0_0_18px_rgba(249,115,22,0.6)]',
      animationClass: 'animate-pulse',
      isAnimated: true
    })
  },

  // Инвентарь пользователя (Рамки, темы, значки)
  inventory: {
    frames: [
      {
        frameId: { type: String, required: true },
        acquiredAt: { type: Date, default: Date.now },
        source: { type: String, default: 'default' }
      }
    ]
  },

  // Роли и доступ
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin', 'owner'],
    default: 'user'
  },

  // Платная подписка
  subscription: {
    type: String,
    enum: ['FREE', 'PLUS', 'VIP', 'PREMIUM'],
    default: 'FREE'
  },
  subscriptionExpires: {
    type: Date,
    default: null
  },

  // Внутренняя экономика и геймификация
  norCoins: {
    type: Number,
    default: 200,
    min: 0
  },
  level: {
    type: Number,
    default: 1
  },
  xp: {
    type: Number,
    default: 0
  },

  // Настройки приватности и отображения
  isPrivate: { type: Boolean, default: false },
  hideFollowers: { type: Boolean, default: false },
  hideOnlineStatus: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },

  // Подтверждение и безопасность
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String, default: null, select: false },
  verificationCodeExpires: { type: Date, default: null },
  googleId: { type: String, default: null, sparse: true, unique: true },
  resetPasswordCode: { type: String, default: null, select: false },
  resetPasswordExpires: { type: Date, default: null },

  // Модерация и блокировка
  isBanned: { type: Boolean, default: false },
  banReason: { type: String, default: null },
  bannedUntil: { type: Date, default: null }

}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Виртуальное поле для расчета возраста
userSchema.virtual('age').get(function () {
  if (!this.birthDate) return null;
  const today = new Date();
  let age = today.getFullYear() - this.birthDate.getFullYear();
  const m = today.getMonth() - this.birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < this.birthDate.getDate())) {
    age--;
  }
  return age;
});

// Индексы для быстрой выборки
userSchema.index({ region: 1 });
userSchema.index({ isBanned: 1 });
userSchema.index({ username: 1 });

module.exports = mongoose.model('User', userSchema);