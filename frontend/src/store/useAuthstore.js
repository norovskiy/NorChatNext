import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axios';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      register: async (userData) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/api/auth/register', userData); // ← ИСПРАВЛЕНО
          const { token, user } = response.data;
          localStorage.setItem('norchat_token', token);
          set({
            token,
            user,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            message: error.response?.data?.message || 'Registration failed'
          };
        }
      },

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/api/auth/login', credentials); // ← ИСПРАВЛЕНО
          const { token, user } = response.data;
          localStorage.setItem('norchat_token', token);
          set({
            token,
            user,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            message: error.response?.data?.message || 'Login failed'
          };
        }
      },

      googleAuth: async (idToken) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/api/auth/google', { idToken }); // ← ИСПРАВЛЕНО
          const { token, user } = response.data;
          localStorage.setItem('norchat_token', token);
          set({
            token,
            user,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            message: error.response?.data?.message || 'Google auth failed'
          };
        }
      },

      updateUser: async (userData) => {
        set({ isLoading: true });
        try {
          const response = await api.put('/api/users/profile', userData); // ← ИСПРАВЛЕНО
          const { user } = response.data;
          set({
            user,
            isLoading: false,
          });
          return { success: true, user };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            message: error.response?.data?.message || 'Update failed'
          };
        }
      },

      checkAuth: async () => {
        const token = localStorage.getItem('norchat_token');
        if (!token) {
          set({ isAuthenticated: false, user: null, token: null });
          return { success: false };
        }

        set({ isLoading: true });
        try {
          const response = await api.get('/api/auth/me'); // ← ИСПРАВЛЕНО
          const user = response.data.user;
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            token,
          });
          return { success: true, user };
        } catch (error) {
          localStorage.removeItem('norchat_token');
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
          return { success: false };
        }
      },

      logout: () => {
        localStorage.removeItem('norchat_token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
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