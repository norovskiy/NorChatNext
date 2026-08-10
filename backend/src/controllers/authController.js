const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// ========== ГЕНЕРАЦИЯ ТОКЕНА ==========
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ========== РЕГИСТРАЦИЯ ==========
const register = async (req, res) => {
  try {
    const {
      email,
      password,
      nickname,
      username,
      gender,
      birthDate,
      region
    } = req.body;

    // Проверяем обязательные поля
    if (!email || !password || !username || !birthDate) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, username and birthDate are required'
      });
    }

    // Проверяем дату рождения
    const parsedBirthDate = new Date(birthDate);

    if (Number.isNaN(parsedBirthDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid birthDate'
      });
    }

    // Проверяем, что дата рождения не в будущем
    if (parsedBirthDate > new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Birth date cannot be in the future'
      });
    }

    // Рассчитываем возраст
    const today = new Date();
    let age = today.getFullYear() - parsedBirthDate.getFullYear();

    const hasBirthdayPassed =
      today.getMonth() > parsedBirthDate.getMonth() ||
      (
        today.getMonth() === parsedBirthDate.getMonth() &&
        today.getDate() >= parsedBirthDate.getDate()
      );

    if (!hasBirthdayPassed) {
      age--;
    }

    // Проверяем возраст (16+)
    if (!Number.isInteger(age) || age < 16 || age > 120) {
      return res.status(400).json({
        success: false,
        message: 'You must be at least 16 years old'
      });
    }

    // Проверка существования
    const userExists = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Хеш пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание пользователя
    const user = await User.create({
      email,
      password: hashedPassword,
      nickname: nickname || username, // ← Если nickname нет, используем username
      username,
      gender: gender || 'male',
      birthDate: parsedBirthDate,
      region: region || 'International',
      age
    });

    // Генерация токена
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        nickname: user.nickname,
        username: user.username,
        gender: user.gender,
        region: user.region,
        age: user.age,
        birthDate: user.birthDate,
        norCoins: user.norCoins,
        subscription: user.subscription,
        level: user.level,
        xp: user.xp
      }
    });

  } catch (error) {
    console.error('REGISTER ERROR:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ========== ЛОГИН ==========
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        nickname: user.nickname,
        username: user.username,
        gender: user.gender,
        region: user.region,
        age: user.age,
        birthDate: user.birthDate,
        norCoins: user.norCoins,
        subscription: user.subscription,
        level: user.level,
        xp: user.xp
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ========== GOOGLE AUTH ==========
const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;
    // TODO: Реализовать Google OAuth
    res.json({
      success: true,
      message: 'Google auth coming soon'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ========== GET ME ==========
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        nickname: user.nickname,
        username: user.username,
        gender: user.gender,
        region: user.region,
        age: user.age,
        birthDate: user.birthDate,
        norCoins: user.norCoins,
        subscription: user.subscription,
        level: user.level,
        xp: user.xp
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ========== UPDATE PROFILE ==========
const updateProfile = async (req, res) => {
  try {
    const { nickname, birthDate, region } = req.body; // ← birthDate вместо age

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (nickname !== undefined && nickname.length >= 2) {
      user.nickname = nickname;
    }

    // Обработка даты рождения
    if (birthDate !== undefined) {
      const parsedBirthDate = new Date(birthDate);

      if (Number.isNaN(parsedBirthDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid birthDate format'
        });
      }

      if (parsedBirthDate > new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Birth date cannot be in the future'
        });
      }

      // Рассчитываем возраст
      const today = new Date();
      let age = today.getFullYear() - parsedBirthDate.getFullYear();

      const hasBirthdayPassed =
        today.getMonth() > parsedBirthDate.getMonth() ||
        (
          today.getMonth() === parsedBirthDate.getMonth() &&
          today.getDate() >= parsedBirthDate.getDate()
        );

      if (!hasBirthdayPassed) {
        age--;
      }

      // Проверяем возраст (16+)
      if (!Number.isInteger(age) || age < 16 || age > 120) {
        return res.status(400).json({
          success: false,
          message: 'You must be at least 16 years old'
        });
      }

      user.birthDate = parsedBirthDate;
      user.age = age;
    }

    if (region !== undefined) {
      user.region = region;
    }

    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        nickname: user.nickname,
        username: user.username,
        gender: user.gender,
        region: user.region,
        age: user.age,
        birthDate: user.birthDate,
        norCoins: user.norCoins,
        subscription: user.subscription,
        level: user.level,
        xp: user.xp
      }
    });

  } catch (error) {
    console.error('UPDATE PROFILE ERROR:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  register,
  login,
  googleAuth,
  getMe,
  updateProfile
};