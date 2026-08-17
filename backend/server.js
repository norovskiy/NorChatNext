const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const adminRoutes = require('./src/routes/adminRoutes'); // 👈 1. Импорт роутов админки
const socketHandler = require('./src/socket/socketHandler');

const app = express();
const server = http.createServer(app);

// 🔑 Доверяем прокси (Render, Heroku, Cloudflare)
app.set('trust proxy', 1);

// 🛡️ Безопасность HTTP-заголовков
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 🛡️ Глобальный Rate Limiter (Защита от DDoS)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Слишком много запросов с вашего IP, попробуйте позже.' }
});
app.use(globalLimiter);

// CORS Настройка
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// 📦 Парсинг JSON
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// HTTP Роуты
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes); // 👈 2. Подключение роутов админки

// Проверка здоровья сервера
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'NorChat API v2.0', status: 'running' });
});

// Инициализация Socket.IO
const io = new Server(server, {
  cors: corsOptions,
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling']
});

// 👈 3. Сохраняем io в инстанс Express для доступа в контроллерах (req.app.get('io'))
app.set('io', io);

socketHandler(io);

// 404 & Error Handlers
app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.stack);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

// Подключение к MongoDB
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => {
    console.error('❌ MongoDB error:', err);
    process.exit(1);
  });

// Self-ping для предотвращения гибернации
if (process.env.SELF_PING_URL) {
  setInterval(async () => {
    try {
      await fetch(process.env.SELF_PING_URL);
    } catch (_) {}
  }, 10 * 60 * 1000);
}

const PORT = process.env.PORT || 5001;
const runningServer = server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Graceful Shutdown
const shutdown = async () => {
  console.log('⏳ Shutting down server...');
  runningServer.close(async () => {
    try {
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed.');
      process.exit(0);
    } catch (err) {
      console.error('❌ Error during shutdown:', err);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});