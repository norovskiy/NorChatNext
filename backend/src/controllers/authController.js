const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

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
  } catch (err) {
    console.error('❌ Mailer error:', err.message);
    return false;
  }
};

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// Криптографически стойкая генерация 6-значного кода
const generateSecureCode = () => crypto.randomInt(100000, 1000000).toString();

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
      <p style="color: #666; font-size: 14px;">⏰ Код действителен 10 минут. Максимум 5 попыток ввода.</p>
    </div>
  </div>
`;

const register = async (req, res) => {
  try {
    const { email, username, password, gender, nickname, birthDate, region } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ success: false, message: 'Все поля (email, username, password) обязательны' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ success: false, message: 'Некорректный формат email' });
    }

    if (normalizedUsername.length < 3 || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Имя пользователя от 3 символов, пароль от 6 символов' });
    }

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }]
    });

    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({ 
          success: false, 
          message: existingUser.email === normalizedEmail 
            ? 'Пользователь с таким email уже зарегистрирован' 
            : 'Это имя пользователя уже занято' 
        });
      }
      
      // Защита: Если запись существует, но не подтверждена и код еще не истек — не даем перезаписать чужой аккаунт
      if (existingUser.verificationCodeExpires > new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Код подтверждения уже отправлен. Дождитесь истечения 10 минут перед повторной попыткой.'
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateSecureCode();
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
      verificationAttempts: 0, // Инициализация счетчика попыток
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
      message: 'Код подтверждения отправлен на вашу почту',
      ...(process.env.NODE_ENV !== 'production' && !emailSent && { devCode: verificationCode })
    });

  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ success: false, message: 'Ошибка при регистрации' });
  }
};

const verifyRegistrationCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email и код обязательны' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail, isVerified: false });

    if (!user || !user.verificationCode || !user.verificationCodeExpires) {
      return res.status(400).json({ success: false, message: 'Запрос на подтверждение не найден или уже выполнен' });
    }

    // Проверка срока действия кода
    if (user.verificationCodeExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'Срок действия кода истек. Зарегистрируйтесь снова.' });
    }

    // Защита от брутфорса: сброс кода после 5 неверных попыток
    if ((user.verificationAttempts || 0) >= 5) {
      await User.updateOne(
        { _id: user._id },
        { $set: { verificationCode: null, verificationCodeExpires: null, verificationAttempts: 0 } }
      );
      return res.status(400).json({ success: false, message: 'Превышено количество попыток. Запросите код заново.' });
    }

    if (user.verificationCode !== code.trim()) {
      await User.updateOne({ _id: user._id }, { $inc: { verificationAttempts: 1 } });
      return res.status(400).json({ success: false, message: 'Неверный код подтверждения' });
    }

    user.verificationCode = null;
    user.verificationCodeExpires = null;
    user.verificationAttempts = 0;
    user.isVerified = true;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: publicUser(user)
    });

  } catch (error) {
    console.error('Verify Registration Error:', error);
    res.status(500).json({ success: false, message: 'Ошибка проверки кода' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Укажите email/username и пароль' });
    }

    const identifier = email.trim().toLowerCase();
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    });

    if (!user || !(await bcrypt.compare(password, user.password || ''))) {
      return res.status(401).json({ success: false, message: 'Неверный логин или пароль' });
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
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Ошибка при входе' });
  }
};

const googleAuth = async (req, res) => {
  try {
    const rawToken = req.body.idToken || req.body.credential || req.body.token || req.body.googleToken || req.body.accessToken;

    if (!rawToken) {
      return res.status(400).json({ success: false, message: 'Google token is required' });
    }

    let email, name, picture, googleId, audience;

    if (typeof rawToken === 'string' && rawToken.startsWith('eyJ')) {
      const idTokenRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${rawToken}`);
      if (idTokenRes.ok) {
        const data = await idTokenRes.json();
        email = data.email;
        name = data.name;
        picture = data.picture;
        googleId = data.sub;
        audience = data.aud;
      }
    }

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
      }
    }

    if (!email) {
      return res.status(401).json({ success: false, message: 'Недействительный токен Google' });
    }

    // Защита от подмены Client ID
    if (audience && process.env.GOOGLE_CLIENT_ID && audience !== process.env.GOOGLE_CLIENT_ID) {
      return res.status(401).json({ success: false, message: 'Токен предназначен для другого приложения' });
    }

    const normalizedEmail = email.toLowerCase();
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // Безопасная генерация уникального username
      let baseUsername = normalizedEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
      if (baseUsername.length < 3) baseUsername = 'user_' + baseUsername;
      
      let username = baseUsername;
      let counter = 1;
      while (await User.exists({ username })) {
        username = `${baseUsername}_${crypto.randomInt(1000, 9999)}`;
        counter++;
        if (counter > 10) break;
      }

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
      await User.updateOne({ _id: user._id }, { $set: { googleId, isVerified: true } });
    }

    const token = generateToken(user._id);
    return res.json({ success: true, token, user: publicUser(user) });

  } catch (error) {
    console.error('Google Auth Error:', error);
    return res.status(500).json({ success: false, message: 'Ошибка аутентификации Google' });
  }
};

const getMe = async (req, res) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { nickname, birthDate, region } = req.body;
    const update = {};

    if (nickname !== undefined) {
      if (nickname.trim().length < 2) {
        return res.status(400).json({ success: false, message: 'Имя должно быть от 2 символов' });
      }
      update.nickname = nickname.trim();
    }

    if (birthDate !== undefined) {
      const parsed = new Date(birthDate);
      if (Number.isNaN(parsed.getTime()) || parsed > new Date()) {
        return res.status(400).json({ success: false, message: 'Некорректная дата рождения' });
      }

      const today = new Date();
      let age = today.getFullYear() - parsed.getFullYear();
      const hadBirthday =
        today.getMonth() > parsed.getMonth() ||
        (today.getMonth() === parsed.getMonth() && today.getDate() >= parsed.getDate());
      if (!hadBirthday) age--;

      if (age < 16 || age > 120) {
        return res.status(400).json({ success: false, message: 'Минимальный возраст — 16 лет' });
      }

      update.birthDate = parsed;
      update.age = age;
    }

    if (region !== undefined) update.region = region;

    const user = await User.findByIdAndUpdate(req.user.id, update, {
      new: true,
      runValidators: true
    }).select('-password');

    if (!user) return res.status(404).json({ success: false, message: 'Пользователь не найден' });

    res.json({ success: true, user: publicUser(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Ошибка обновления профиля' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email обязателен' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail, isVerified: true });

    let emailSent = false;
    let code = null;

    if (user) {
      code = generateSecureCode();
      await User.updateOne(
        { _id: user._id },
        { 
          $set: { 
            resetPasswordCode: code, 
            resetPasswordExpires: new Date(Date.now() + 10 * 60 * 1000),
            resetPasswordAttempts: 0 // Сброс счетчика попыток
          } 
        }
      );
      emailSent = await sendMailSafe({
        to: normalizedEmail,
        subject: '🔐 Восстановление пароля NorChat',
        html: codeEmailHtml(code)
      });
    }

    // Унифицированный ответ для предотвращения утечки существующих email
    res.json({
      success: true,
      message: 'Если аккаунт с таким email существует, код отправлен на почту',
      ...(process.env.NODE_ENV !== 'production' && code && { devCode: code, emailSent })
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Ошибка обработки запроса' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Неверные данные или пароль короче 6 символов' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !user.resetPasswordCode || !user.resetPasswordExpires) {
      return res.status(400).json({ success: false, message: 'Запрос на сброс пароля не найден или недействителен' });
    }

    if (user.resetPasswordExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'Срок действия кода истек' });
    }

    // Защита от брутфорса: сброс кода после 5 неудачных попыток
    if ((user.resetPasswordAttempts || 0) >= 5) {
      await User.updateOne(
        { _id: user._id },
        { $set: { resetPasswordCode: null, resetPasswordExpires: null, resetPasswordAttempts: 0 } }
      );
      return res.status(400).json({ success: false, message: 'Превышено количество попыток. Запросите сброс пароля заново.' });
    }

    if (user.resetPasswordCode !== code.trim()) {
      await User.updateOne({ _id: user._id }, { $inc: { resetPasswordAttempts: 1 } });
      return res.status(400).json({ success: false, message: 'Неверный код восстановления' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.updateOne(
      { _id: user._id },
      { 
        $set: { 
          password: hashedPassword, 
          isVerified: true,
          resetPasswordCode: null, 
          resetPasswordExpires: null,
          resetPasswordAttempts: 0 
        } 
      }
    );

    res.json({ success: true, message: 'Пароль успешно изменен' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ success: false, message: 'Ошибка сброса пароля' });
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