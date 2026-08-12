import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axios';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true, // Флаг ТОЛЬКО для первой проверки авторизации при старте приложения!

      // ========== РЕГИСТРАЦИЯ ==========
      register: async (data) => {
        try {
          const response = await api.post('/api/auth/register', data);
          console.log('🔥 REGISTER API RESPONSE:', response.data);
          return { success: true, data: response.data };
        } catch (error) {
          console.error('❌ Register error:', error.response?.data);
          return {
            success: false,
            message: error.response?.data?.message || 'Registration failed'
          };
        }
      },

      // ========== ПРОВЕРКА КОДА РЕГИСТРАЦИИ ==========
      verifyCode: async (email, code) => {
        console.log('🚀 verifyCode called with:', { email, code });
        try {
          const response = await api.post('/api/auth/verify-registration', {
            email: email.trim().toLowerCase(),
            code: code.trim()
          });
          console.log('🔥 VERIFY API RESPONSE:', response.data);

          const { token, user } = response.data;

          if (token) {
            localStorage.setItem('norchat_token', token);
            console.log('✅ Token saved to localStorage');
          }

          set({
            token,
            user,
            isAuthenticated: !!token,
            isLoading: false,
          });

          return { success: true, data: response.data };
        } catch (error) {
          console.error('❌ Verify code error:', error.response?.data);
          return {
            success: false,
            message: error.response?.data?.message || 'Invalid code'
          };
        }
      },

      // ========== ЛОГИН ==========
      login: async (credentials) => {
        // ❌ УБРАЛИ set({ isLoading: true }) — чтобы App.jsx не перехватывал экран
        try {
          const response = await api.post('/api/auth/login', credentials);
          const { token, user } = response.data;
          
          localStorage.setItem('norchat_token', token);
          set({ token, user, isAuthenticated: true, isLoading: false });
          
          return { success: true, data: response.data };
        } catch (error) {
          return {
            success: false,
            message: error.response?.data?.message || 'Login failed'
          };
        }
      },

      // ========== GOOGLE AUTH ==========
      googleAuth: async (idToken) => {
        // ❌ УБРАЛИ set({ isLoading: true })
        try {
          const response = await api.post('/api/auth/google', { idToken });
          const { token, user } = response.data;
          
          localStorage.setItem('norchat_token', token);
          set({ token, user, isAuthenticated: true, isLoading: false });
          
          return { success: true, data: response.data };
        } catch (error) {
          return {
            success: false,
            message: error.response?.data?.message || 'Google auth failed'
          };
        }
      },

      // ========== ОБНОВЛЕНИЕ ПРОФИЛЯ ==========
      updateUser: async (data) => {
        try {
          const response = await api.put('/api/users/profile', data);
          set({ user: response.data.user });
          return { success: true, user: response.data.user };
        } catch (error) {
          return {
            success: false,
            message: error.response?.data?.message || 'Update failed'
          };
        }
      },

      // ========== ЗАБЫЛИ ПАРОЛЬ ==========
      forgotPassword: async (email) => {
        try {
          const response = await api.post('/api/auth/forgot-password', { email });
          console.log('✅ Forgot password response:', response.data);
          return { success: true, data: response.data };
        } catch (error) {
          console.error('❌ Forgot password error:', error.response?.data);
          return {
            success: false,
            message: error.response?.data?.message || 'Failed to send code'
          };
        }
      },

      // ========== СБРОС ПАРОЛЯ ==========
      resetPassword: async ({ email, code, newPassword }) => {
        try {
          const response = await api.post('/api/auth/reset-password', { email, code, newPassword });
          console.log('✅ Reset password response:', response.data);
          return { success: true, data: response.data };
        } catch (error) {
          console.error('❌ Reset password error:', error.response?.data);
          return {
            success: false,
            message: error.response?.data?.message || 'Failed to reset password'
          };
        }
      },

      // ========== ПРОВЕРКА АВТОРИЗАЦИИ (ЕДИНСТВЕННОЕ МЕСТО, УПРАВЛЯЮЩЕЕ isLoading) ==========
      checkAuth: async () => {
        const token = localStorage.getItem('norchat_token');

        if (!token) {
          set({ isAuthenticated: false, user: null, token: null, isLoading: false });
          return { success: false };
        }

        try {
          const response = await api.get('/api/auth/me');
          set({ user: response.data.user, isAuthenticated: true, isLoading: false, token });
          return { success: true };
        } catch (error) {
          localStorage.removeItem('norchat_token');
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
          return { success: false };
        }
      },

      // ========== ВЫХОД ==========
      logout: () => {
        localStorage.removeItem('norchat_token');
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      },

      getToken: () => get().token || localStorage.getItem('norchat_token'),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;