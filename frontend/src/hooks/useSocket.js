import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const useSocket = (url, token) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Не пытаемся подключиться, пока нет URL или токена
    if (!url || !token) return;

    const newSocket = io(url, {
      transports: ['websocket'],
      auth: {
        token, // Отправляем чистый токен без 'Bearer '
      },
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [url, token]);

  return socket;
};

export default useSocket;