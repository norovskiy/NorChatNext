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
  nickname: {
    type: String,
    required: false,  // ✅ СДЕЛАЙ false
    trim: true,
    minlength: 2,
    maxlength: 16
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
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: false,  // ✅ СДЕЛАЙ false
    default: 'male'
  },
  birthDate: {
    type: Date,
    required: false  // ✅ СДЕЛАЙ false
  },
  age: {
    type: Number,
    min: 16,
    max: 100
  },
  region: {
    type: String,
    default: 'International'
  },
  avatar: {
    type: String,
    default: 'https://ui-avatars.com/api/?background=667ea&color=fff&size=128'
  },
  role: {
    type: String,
    enum: ['user', 'vip', 'premium', 'admin', 'owner'],
    default: 'user'
  },
  subscription: {
    type: String,
    enum: ['FREE', 'PLUS', 'VIP', 'PREMIUM'],
    default: 'FREE'
  },
  subscriptionExpires: {
    type: Date,
    default: null
  },
  norCoins: {
    type: Number,
    default: 200
  },
  level: {
    type: Number,
    default: 1
  },
  xp: {
    type: Number,
    default: 0
  },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isPrivate: { type: Boolean, default: false },
  hideFollowers: { type: Boolean, default: false },
  spacesCount: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String, default: null },
  googleId: { type: String, default: null, sparse: true, unique: true },
  resetPasswordCode: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null }
}, { timestamps: true });

userSchema.index({ resetPasswordCode: 1 });
userSchema.index({ region: 1 });

module.exports = mongoose.model('User', userSchema);