import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Verify from './pages/Verify';
import Welcome from './pages/Welcome';
import Homepage from './pages/Homepage';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard'; // 👈 Страница админки
import useAuthStore from './store/useAuthStore';

// Защищенный роут только для Admin и Owner
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin' && user?.role !== 'owner') {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/40 text-sm">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />}
          />
          <Route
            path="/register"
            element={!isAuthenticated ? <Register /> : <Navigate to="/" replace />}
          />
          <Route path="/verify" element={<Verify />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/profile" element={<Profile />} />

          {/* Маршрут Админ-панели */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard/>
              </AdminRoute>
            }
          />

          <Route
            path="/"
            element={isAuthenticated ? <Homepage /> : <Navigate to="/" replace />}
          />

          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />}
          />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;