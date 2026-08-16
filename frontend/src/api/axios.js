import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Перехватчик запросов: автоматическое подставление JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('norchat_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Перехватчик ответов: авто-очистка при 401 (просроченный/невалидный токен)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('norchat_token');
      
      // Перенаправляем на вход, если пользователь не на публичной странице
      if (!['/login', '/register', '/welcome'].includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;