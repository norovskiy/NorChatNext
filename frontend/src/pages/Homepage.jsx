import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import ProfileModal from '../components/Modals/ProfileModal';

const Homepage = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser, isAuthenticated } = useAuthStore();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Если у пользователя нет nickname или birthDate — показываем модалку
    if (!user?.nickname || !user?.birthDate) {
      setShowProfileModal(true);
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileSubmit = async (data) => {
    setIsProfileLoading(true);
    try {
      const result = await updateUser(data);
      if (result.success) {
        setShowProfileModal(false);
      }
      return result;
    } finally {
      setIsProfileLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            <span className="text-white">Nor</span>
            <span className="text-orange-500">Chat</span>
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-white/60 text-sm">
              👋 {user?.nickname || 'User'}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/20 border border-red-500/40 rounded-xl text-red-200 text-sm hover:bg-red-500/30 transition-all"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl mb-6">
            <h2 className="text-xl font-semibold mb-2 text-white">
              Добро пожаловать, {user?.nickname || 'User'}! 👋
            </h2>
            <p className="text-white/60 text-sm">
              Это ваша главная страница в NorChat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:bg-white/10 transition-all cursor-pointer">
              <div className="text-3xl mb-3">💬</div>
              <h3 className="text-white font-semibold">Чаты</h3>
              <p className="text-white/40 text-sm mt-1">Ваши активные чаты</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:bg-white/10 transition-all cursor-pointer">
              <div className="text-3xl mb-3">👥</div>
              <h3 className="text-white font-semibold">Друзья</h3>
              <p className="text-white/40 text-sm mt-1">Ваши друзья онлайн</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl hover:bg-white/10 transition-all cursor-pointer">
              <div className="text-3xl mb-3">🚀</div>
              <h3 className="text-white font-semibold">Spaces</h3>
              <p className="text-white/40 text-sm mt-1">Ваши пространства</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
            <p className="text-orange-500 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
              Space Hub — скоро здесь появятся ваши комнаты!
            </p>
          </div>
        </div>
      </main>

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => {
          if (user?.nickname && user?.birthDate) {
            setShowProfileModal(false);
          }
        }}
        onSubmit={handleProfileSubmit}
        isLoading={isProfileLoading}
      />
    </div>
  );
};

export default Homepage;