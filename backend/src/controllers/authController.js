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
  } catch (error) {
    console.error('❌ Email error:', error.message);
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

// ========== 1. РЕГИСТРАЦИЯ (ОТПРАВКА КОДА) ==========
const register = async (req, res) => {
  try {
    const { email, username, password, gender, nickname, birthDate, region } = req.body;

    console.log('\n========== REGISTER ==========');
    console.log('📝 Email:', email);
    console.log('📝 Username:', username);

    if (!email || !username || !password) {
      return res.status(400).json({ success: false, message: 'Email, username and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim().toLowerCase();

    if (!normalizedEmail.includes('@') || !normalizedEmail.includes('.')) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    if (normalizedUsername.length < 3) {
      return res.status(400).json({ success: false, message: 'Username must be at least 3 characters' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
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

    let user;

    if (existingUser && !existingUser.isVerified) {
      existingUser.username = normalizedUsername;
      existingUser.password = hashedPassword;
      existingUser.nickname = nickname || normalizedUsername;
      existingUser.gender = gender || 'male';
      existingUser.birthDate = birthDate || null;
      existingUser.region = region || 'International';
      existingUser.verificationCode = verificationCode;
      
      user = await existingUser.save();
      console.log('🔄 Неподтвержденный пользователь обновлен:', normalizedEmail);
    } else {
      user = await User.create({
        email: normalizedEmail,
        username: normalizedUsername,
        password: hashedPassword,
        nickname: nickname || normalizedUsername,
        gender: gender || 'male',
        birthDate: birthDate || null,
        region: region || 'International',
        verificationCode: verificationCode,
        isVerified: false
      });
      console.log('✅ Новый неподтвержденный пользователь создан:', normalizedEmail);
    }

    console.log('🔑 Verification code:', verificationCode);

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
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
};

// ========== 2. ПРОВЕРКА КОДА РЕГИСТРАЦИИ ==========
const verifyRegistrationCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    console.log('\n========== VERIFY CODE ==========');
    console.log('📝 Email:', email);
    console.log('🔑 Code:', code);

    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email and code are required' });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      verificationCode: code.trim()
    });

    if (!user) {
      console.log('❌ Invalid code');
      return res.status(400).json({ success: false, message: 'Неверный код подтверждения' });
    }

    user.verificationCode = null;
    user.isVerified = true;
    await user.save();

    console.log('✅ Email verified successfully');

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: publicUser(user)
    });

  } catch (error) {
    console.error('❌ Verify code error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== 3. ЛОГИН ==========
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('\n========== LOGIN ==========');
    console.log('📝 Identifier:', email);

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email/username and password are required' });
    }

    const identifier = email.trim().toLowerCase();

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email/username or password' });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Пожалуйста, сначала подтвердите email кодом из письма.'
      });
    }

    if (!user.password) {
      return res.status(401).json({ success: false, message: 'This account uses Google login. Please use "Login with Google".' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ success: false, message: 'Invalid email/username or password' });
    }

    const token = generateToken(user._id);

    res.json({ success: true, token, user: publicUser(user) });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
};

// ========== 4. GOOGLE AUTH ==========
const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ success: false, message: 'Google token is required' });
    }

    const googleResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${idToken}` }
    });

    if (!googleResponse.ok) {
      return res.status(401).json({ success: false, message: 'Invalid or expired Google token' });
    }

    const googleUser = await googleResponse.json();
    const { email, name, picture, sub: googleId } = googleUser;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Google account has no email' });
    }

    const normalizedEmail = email.toLowerCase();
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      const username = normalizedEmail.split('@')[0] + '_' + Math.floor(Math.random() * 10000);
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

    const token = generateToken(user._id);
    res.json({ success: true, token, user: publicUser(user) });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ success: false, message: 'Google authentication failed' });
  }
};

// ========== 5. GET ME ==========
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user: publicUser(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
};

// ========== 6. UPDATE PROFILE ==========
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
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Profile update failed' });
  }
};

// ========== 7. ЗАБЫЛИ ПАРОЛЬ ==========
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
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Failed to process request' });
  }
};

// ========== 8. СБРОС ПАРОЛЯ ==========
const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
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

    // Меняем пароль, подтверждаем аккаунт и очищаем одноразовый код
    await User.updateOne(
      { _id: user._id },
      { 
        $set: { 
          password: hashedPassword, 
          isVerified: true, // 👈 Теперь аккаунт автоматически становится подтверждённым!
          resetPasswordCode: null, 
          resetPasswordExpires: null 
        } 
      }
    );

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Failed to reset password' });
  }
};

// ВСЕ ФУНКЦИИ В ЭКСПОРТЕ:
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