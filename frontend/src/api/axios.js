import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL || 'http://localhost:5001',
  withCredentials: true,
});

console.log('🌐 API baseURL:', api.defaults.baseURL);

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('norchat_token');
    console.log('🔑 Token in interceptor:', token ? '✅ exists' : '❌ not found');
    
    if (token && token !== 'undefined' && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Authorization header added');
    } else {
      console.log('❌ No valid token, skipping Authorization');
    }
    
    console.log('📡 Request:', config.method.toUpperCase(), config.baseURL + config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ Response error:', error.response?.status, error.config?.url);
    console.error('❌ Error data:', error.response?.data);
    
    // НЕ ДЕЛАЕМ РЕЛОАД! Просто возвращаем ошибку
    return Promise.reject(error);
  }
);

export default api;