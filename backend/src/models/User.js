const mongoose = require('mongoose');

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
    required: false
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
  avatar: {
    type: String,
    default: 'https://ui-avatars.com/api/?background=667ea&color=fff&size=128'
  },

  // Роли и доступ (без смешивания с подписками)
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
  verificationCode: { type: String, default: null },
  verificationCodeExpires: { type: Date, default: null },
  googleId: { type: String, default: null, sparse: true, unique: true },
  resetPasswordCode: { type: String, default: null },
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

// Виртуальное поле для расчета возраста (не хранится в БД)
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

// Индексы
userSchema.index({ region: 1 });
userSchema.index({ isBanned: 1 });

module.exports = mongoose.model('User', userSchema);