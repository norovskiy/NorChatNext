const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendMailSafe = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return false;
  try {
    await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, html });
    return true;
  } catch {
    return false;
  }
};

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const publicUser = (user) => ({
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
  xp: user.xp,
  avatar: user.avatar
});

const codeEmailHtml = (code) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a0a; color: #fff; border-radius: 16px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="font-size: 28px; font-weight: bold;">
        <span style="color: #fff;">Nor</span><span style="color: #f97316;">Chat</span>
      </h1>
    </div>
    <div style="background: #1a1a1a; padding: 30px; border-radius: 12px; border: 1px solid #333;">
      <h2 style="color: #f97316; margin-top: 0;">Код подтверждения</h2>
      <p style="color: #aaa; line-height: 1.6;">Введите этот код в приложении для продолжения:</p>
      <div style="text-align: center; margin: 30px 0; padding: 20px; background: #0a0a0a; border-radius: 12px; border: 2px solid #f97316;">
        <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #f97316; font-family: monospace;">${code}</span>
      </div>
      <p style="color: #666; font-size: 14px;">⏰ Код действителен 10 минут.</p>
    </div>
  </div>
`;

const register = async (req, res) => {
  try {
    const { email, username, password, gender, nickname, birthDate, region } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ success: false, message: 'Email, username and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim().toLowerCase();

    if (!normalizedEmail.includes('@') || !normalizedEmail.includes('.')) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    if (normalizedUsername.length < 3 || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Validation failed for username or password length' });
    }

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }]
    });

    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ 
        success: false, 
        message: existingUser.email === normalizedEmail 
          ? 'Пользователь с таким email уже зарегистрирован' 
          : 'Это имя пользователя уже занято' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

    const userData = {
      email: normalizedEmail,
      username: normalizedUsername,
      password: hashedPassword,
      nickname: nickname || normalizedUsername,
      gender: gender || 'male',
      birthDate: birthDate || null,
      region: region || 'International',
      verificationCode,
      verificationCodeExpires,
      isVerified: false
    };

    if (existingUser && !existingUser.isVerified) {
      await User.updateOne({ _id: existingUser._id }, { $set: userData });
    } else {
      await User.create(userData);
    }

    const emailSent = await sendMailSafe({
      to: normalizedEmail,
      subject: '🔐 Подтверждение регистрации NorChat',
      html: codeEmailHtml(verificationCode)
    });

    res.status(201).json({
      success: true,
      message: 'Verification code sent to your email',
      ...(process.env.NODE_ENV !== 'production' && !emailSent && { devCode: verificationCode })
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
};

const verifyRegistrationCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email and code are required' });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      verificationCode: code.trim(),
      verificationCodeExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Неверный или истекший код подтверждения' });
    }

    user.verificationCode = null;
    user.verificationCodeExpires = null;
    user.isVerified = true;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: publicUser(user)
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email/username and password are required' });
    }

    const identifier = email.trim().toLowerCase();
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    });

    if (!user || !(await bcrypt.compare(password, user.password || ''))) {
      return res.status(401).json({ success: false, message: 'Invalid email/username or password' });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Пожалуйста, сначала подтвердите email кодом из письма.'
      });
    }

    const token = generateToken(user._id);
    res.json({ success: true, token, user: publicUser(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed' });
  }
};

const googleAuth = async (req, res) => {
  try {
    // 1. Извлекаем токен из любого возможного поля
    const rawToken = req.body.idToken || req.body.credential || req.body.token || req.body.googleToken || req.body.accessToken;

    if (!rawToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'Google token is required' 
      });
    }

    let email, name, picture, googleId;

    // 2. Вариант А: Если токен похоже на ID Token (JWT начинается с eyJ...)
    if (typeof rawToken === 'string' && rawToken.startsWith('eyJ')) {
      const idTokenRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${rawToken}`);
      if (idTokenRes.ok) {
        const data = await idTokenRes.json();
        email = data.email;
        name = data.name;
        picture = data.picture;
        googleId = data.sub;
      }
    }

    // 3. Вариант Б: Если это Access Token (ya29...) или ID Token проверка не прошла
    if (!email) {
      const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${rawToken}` }
      });

      if (userInfoRes.ok) {
        const data = await userInfoRes.json();
        email = data.email;
        name = data.name;
        picture = data.picture;
        googleId = data.sub;
      } else {
        const errText = await userInfoRes.text();
        console.error('❌ Google Token Check Failed:', errText);
      }
    }

    // 4. Если ни один из эндпоинтов Google не подтвердил токен
    if (!email) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired Google token' 
      });
    }

    // 5. Поиск или создание пользователя в БД
    const normalizedEmail = email.toLowerCase();
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      const username = normalizedEmail.split('@')[0] + '_' + Math.floor(1000 + Math.random() * 9000);
      user = await User.create({
        email: normalizedEmail,
        username,
        nickname: name || username,
        googleId,
        password: null,
        gender: 'male',
        birthDate: null,
        region: 'International',
        avatar: picture || undefined,
        isVerified: true
      });
    } else if (!user.googleId) {
      await User.updateOne({ _id: user._id }, { $set: { googleId } });
    }

    // 6. Выдача JWT токена NorChat
    const token = generateToken(user._id);
    
    return res.json({ 
      success: true, 
      token, 
      user: publicUser(user) 
    });

  } catch (error) {
    console.error('❌ Google Auth Internal Error:', error.message);
    return res.status(500).json({ success: false, message: 'Google authentication failed' });
  }
};

const getMe = async (req, res) => {
  try {
    // Пользователь уже проверен и прикреплен к req.user в middleware
    res.json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { nickname, birthDate, region } = req.body;
    const update = {};

    if (nickname !== undefined) {
      if (nickname.length < 2) {
        return res.status(400).json({ success: false, message: 'Nickname must be at least 2 characters' });
      }
      update.nickname = nickname;
    }

    if (birthDate !== undefined) {
      const parsed = new Date(birthDate);
      if (Number.isNaN(parsed.getTime()) || parsed > new Date()) {
        return res.status(400).json({ success: false, message: 'Invalid birthDate' });
      }

      const today = new Date();
      let age = today.getFullYear() - parsed.getFullYear();
      const hadBirthday =
        today.getMonth() > parsed.getMonth() ||
        (today.getMonth() === parsed.getMonth() && today.getDate() >= parsed.getDate());
      if (!hadBirthday) age--;

      if (age < 16 || age > 120) {
        return res.status(400).json({ success: false, message: 'You must be at least 16 years old' });
      }

      update.birthDate = parsed;
      update.age = age;
    }

    if (region !== undefined) update.region = region;

    const user = await User.findByIdAndUpdate(req.user.id, update, {
      new: true,
      runValidators: true
    }).select('-password');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, user: publicUser(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Profile update failed' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    let emailSent = false;
    let code = null;

    if (user) {
      code = Math.floor(100000 + Math.random() * 900000).toString();
      await User.updateOne(
        { _id: user._id },
        { $set: { resetPasswordCode: code, resetPasswordExpires: new Date(Date.now() + 10 * 60 * 1000) } }
      );
      emailSent = await sendMailSafe({
        to: normalizedEmail,
        subject: '🔐 Восстановление пароля NorChat',
        html: codeEmailHtml(code)
      });
    }

    res.json({
      success: true,
      message: 'Если аккаунт с таким email существует, код отправлен на почту',
      ...(process.env.NODE_ENV !== 'production' && code && { devCode: code, emailSent })
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to process request' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Invalid data or password too short' });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      resetPasswordCode: code.trim(),
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired code' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.updateOne(
      { _id: user._id },
      { 
        $set: { 
          password: hashedPassword, 
          isVerified: true,
          resetPasswordCode: null, 
          resetPasswordExpires: null 
        } 
      }
    );

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to reset password' });
  }
};

module.exports = {
  register,
  verifyRegistrationCode,
  login,
  googleAuth,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword
};