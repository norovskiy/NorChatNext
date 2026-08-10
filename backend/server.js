const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// CORS
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// ========== РОУТЫ ==========
const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth', authRoutes);

const userRoutes = require('./src/routes/userRoutes');
app.use('/api/users', userRoutes);

// ========== SOCKET.IO ==========
const io = new Server(server, {
  cors: corsOptions,
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling']
});

// ========== MONGODB ==========
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB error:', err));

// ========== HEALTH CHECK ==========
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'NorChat API', version: '1.0.0', status: 'running' });
});

// ========== SELF-PING ==========
const SELF_PING_URL = process.env.SELF_PING_URL || `http://localhost:${process.env.PORT || 5001}/health`;
setInterval(async () => {
  try {
    const response = await fetch(SELF_PING_URL);
    if (response.ok) console.log(`✅ Self-ping at ${new Date().toISOString()}`);
  } catch (error) {
    console.error(`❌ Self-ping failed: ${error.message}`);
  }
}, 10 * 60 * 1000);

// ========== SOCKET EVENTS ==========
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// ========== ЗАПУСК ==========
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`✅ NorChat Backend is ready!`);
});