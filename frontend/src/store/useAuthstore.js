import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axios';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      checkAuth: async () => {
        const token = localStorage.getItem('norchat_token') || get().token;

        if (!token) {
          set({ isAuthenticated: false, user: null, token: null, isLoading: false });
          return { success: false };
        }

        try {
          const response = await api.get('/api/auth/me');
          const userData = response.data.user || response.data;

          if (userData) {
            set({
              user: userData,
              token,
              isAuthenticated: true,
              isLoading: false,
            });
            return { success: true };
          } else {
            throw new Error('User data is missing');
          }
        } catch (error) {
          console.error('CheckAuth error:', error.response?.status || error.message);
          localStorage.removeItem('norchat_token');
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
          return { success: false };
        }
      },

      login: async (credentials) => {
        try {
          const response = await api.post('/api/auth/login', credentials);
          const { token, user } = response.data;
          
          if (token) {
            localStorage.setItem('norchat_token', token);
          }

          set({ token, user, isAuthenticated: true, isLoading: false });
          return { success: true, data: response.data };
        } catch (error) {
          return {
            success: false,
            message: error.response?.data?.message || 'Login failed',
          };
        }
      },

      googleAuth: async (idToken) => {
        try {
          const response = await api.post('/api/auth/google', { idToken });
          const { token, user } = response.data;
          
          if (token) {
            localStorage.setItem('norchat_token', token);
          }

          set({ token, user, isAuthenticated: true, isLoading: false });
          return { success: true, data: response.data };
        } catch (error) {
          return {
            success: false,
            message: error.response?.data?.message || 'Google auth failed',
          };
        }
      },

      register: async (data) => {
        try {
          const response = await api.post('/api/auth/register', data);
          return { success: true, data: response.data };
        } catch (error) {
          return {
            success: false,
            message: error.response?.data?.message || 'Registration failed',
          };
        }
      },

      verifyCode: async (email, code) => {
        try {
          const response = await api.post('/api/auth/verify-registration', {
            email: email.trim().toLowerCase(),
            code: code.trim(),
          });

          const { token, user } = response.data;

          if (token) {
            localStorage.setItem('norchat_token', token);
          }

          set({ token, user, isAuthenticated: !!token, isLoading: false });
          return { success: true, data: response.data };
        } catch (error) {
          return {
            success: false,
            message: error.response?.data?.message || 'Invalid code',
          };
        }
      },

      updateUser: async (data) => {
        try {
          const response = await api.put('/api/users/profile', data);
          const updatedUser = response.data.user || response.data;
          
          set((state) => ({ user: { ...state.user, ...updatedUser } }));
          return { success: true, user: updatedUser };
        } catch (error) {
          return {
            success: false,
            message: error.response?.data?.message || 'Update failed',
          };
        }
      },

      forgotPassword: async (email) => {
        try {
          const response = await api.post('/api/auth/forgot-password', { email });
          return { success: true, data: response.data };
        } catch (error) {
          return {
            success: false,
            message: error.response?.data?.message || 'Failed to send code',
          };
        }
      },

      resetPassword: async ({ email, code, newPassword }) => {
        try {
          const response = await api.post('/api/auth/reset-password', { email, code, newPassword });
          return { success: true, data: response.data };
        } catch (error) {
          return {
            success: false,
            message: error.response?.data?.message || 'Failed to reset password',
          };
        }
      },

      adminSearchUsers: async (searchQuery) => {
        try {
          const response = await api.get(`/api/admin/users/search?query=${encodeURIComponent(searchQuery)}`);
          return { success: true, users: response.data };
        } catch (error) {
          return {
            success: false,
            message: error.response?.data?.message || 'Ошибка поиска пользователей',
          };
        }
      },

      adminBanUser: async ({ userId, reason, bannedUntil }) => {
        try {
          const response = await api.post('/api/admin/users/ban', { userId, reason, bannedUntil });
          return { success: true, data: response.data };
        } catch (error) {
          return {
            success: false,
            message: error.response?.data?.message || 'Ошибка при блокировке',
          };
        }
      },

      adminUnbanUser: async ({ userId }) => {
        try {
          const response = await api.post('/api/admin/users/unban', { userId });
          return { success: true, data: response.data };
        } catch (error) {
          return {
            success: false,
            message: error.response?.data?.message || 'Ошибка при разблокировке',
          };
        }
      },

      adminGiveCoins: async ({ userId, amount }) => {
        try {
          const response = await api.post('/api/admin/users/coins', { userId, amount });
          return { success: true, data: response.data };
        } catch (error) {
          return {
            success: false,
            message: error.response?.data?.message || 'Ошибка при начислении NorCoins',
          };
        }
      },

      adminGrantSubscription: async ({ userId, plan, durationDays }) => {
        try {
          const response = await api.post('/api/admin/users/subscription', { userId, plan, durationDays });
          return { success: true, data: response.data };
        } catch (error) {
          return {
            success: false,
            message: error.response?.data?.message || 'Ошибка при выдаче подписки',
          };
        }
      },

      adminDeleteUser: async (userId) => {
        try {
          const response = await api.delete(`/api/admin/users/${userId}`);
          return { success: true, data: response.data };
        } catch (error) {
          return {
            success: false,
            message: error.response?.data?.message || 'Ошибка при удалении пользователя',
          };
        }
      },

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