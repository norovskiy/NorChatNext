const jwt = require('jsonwebtoken');

module.exports = (io) => {
  // Middleware авторизации сокета
  io.use((socket, next) => {
    let token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;

    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    // Обработка формата "Bearer <token>"
    if (token.startsWith('Bearer ')) {
      token = token.split(' ')[1];
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Поддержка обоих вариантов payload (id или userId)
      socket.userId = (decoded.id || decoded.userId)?.toString();
      
      if (!socket.userId) {
        return next(new Error('Authentication error: Invalid payload'));
      }

      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  // События подключений
  io.on('connection', (socket) => {
    // 🔑 Присоединяем сокет к личной комнате пользователя (удобно для точечных push-уведомлений и звонков)
    socket.join(socket.userId);

    console.log(`✅ User connected to socket: ${socket.userId} (Socket ID: ${socket.id})`);

    socket.on('disconnect', (reason) => {
      console.log(`❌ User disconnected: ${socket.userId} | Reason: ${reason}`);
    });
  });
};