import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, MessageSquare, Rocket, Shield } from 'lucide-react';
import useAuthStore from '../store/useAuthStore'; // Исправлен регистр пути S -> Store
import { StarsBackground } from '../components/Background/StarsBackgroundDemo';
import Header from '../components/Common/Header';

const Homepage = () => {
  const navigate = useNavigate();
  const { user, checkAuth } = useAuthStore();

  const [showAnimation, setShowAnimation] = useState(() => {
    const saved = localStorage.getItem('norchat_bg_animation');
    return saved !== null ? saved === 'true' : true;
  });

  const toggleBackground = () => {
    setShowAnimation((prev) => {
      const newState = !prev;
      localStorage.setItem('norchat_bg_animation', String(newState));
      return newState;
    });
  };

  // Прослушивание сокет-уведомлений (например, подарок подписки от Owner)
  useEffect(() => {
    const socket = window.socket; // Используем глобальный экземпляр сокета, если подключен
    if (!socket) return;

    const handleNotification = (data) => {
      if (data.type === 'SYSTEM_SUBSCRIPTION_GIFT') {
        alert(`${data.title}\n\n${data.body}`);
        checkAuth(); // Автоматически обновляем данные в Zustand
      }
    };

    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
    };
  }, [checkAuth]);

  const displayName = user?.nickname || user?.username || 'Пользователь';
  const isAdminOrOwner = user?.role === 'admin' || user?.role === 'owner';

  return (
    <div className="relative min-h-screen bg-[#060608] text-white flex flex-col overflow-hidden">
      {showAnimation && (
        <StarsBackground 
          starColor="#FFFFFF"
          factor={0.06}
          speed={0.6}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
      )}

      <div className="absolute w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[150px] pointer-events-none -z-0" />

      <div className="relative z-10 flex flex-col flex-1">
        {/* Единый Header */}
        <Header showAnimation={showAnimation} toggleBackground={toggleBackground} />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto space-y-5">
            {/* Блок приветствия */}
            <div className="bg-[#141418] border border-zinc-800/90 rounded-2xl p-5 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-white">
                    Добро пожаловать, {displayName}! 👋
                  </h2>

                  {/* Бейдж активной подписки */}
                  {user?.subscription && user.subscription !== 'FREE' && (
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                      user.subscription === 'PREMIUM' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                      user.subscription === 'VIP' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {user.subscription}
                    </span>
                  )}
                </div>
                <p className="text-zinc-400 text-xs mt-0.5">Главная страница NorChat</p>
              </div>

              {/* Кнопка быстрого перехода в админ-панель (Видна только Admin и Owner) */}
              {isAdminOrOwner && (
                <button
                  onClick={() => navigate('/admin')}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500/20 to-amber-500/20 hover:from-orange-500/30 hover:to-amber-500/30 text-orange-400 border border-orange-500/30 rounded-xl text-xs font-semibold transition-all shadow-lg shadow-orange-500/5"
                >
                  <Shield size={16} />
                  <span>{user?.role === 'owner' ? 'Панель Owner' : 'Панель Admin'}</span>
                </button>
              )}
            </div>

            {/* Сетка основных разделов */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div 
                onClick={() => navigate('/chats')}
                className="bg-[#141418] border border-zinc-800/90 rounded-2xl p-5 hover:bg-zinc-800/30 hover:border-zinc-700 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <MessageSquare size={20} />
                </div>
                <h3 className="text-sm font-semibold text-white">Чаты</h3>
                <p className="text-zinc-400 text-[11px] mt-0.5">Активные диалоги</p>
              </div>

              <div 
                onClick={() => navigate('/friends')}
                className="bg-[#141418] border border-zinc-800/90 rounded-2xl p-5 hover:bg-zinc-800/30 hover:border-zinc-700 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Users size={20} />
                </div>
                <h3 className="text-sm font-semibold text-white">Друзья</h3>
                <p className="text-zinc-400 text-[11px] mt-0.5">Онлайн список</p>
              </div>

              <div 
                onClick={() => navigate('/spaces')}
                className="bg-[#141418] border border-zinc-800/90 rounded-2xl p-5 hover:bg-zinc-800/30 hover:border-zinc-700 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Rocket size={20} />
                </div>
                <h3 className="text-sm font-semibold text-white">Spaces</h3>
                <p className="text-zinc-400 text-[11px] mt-0.5">Ваши пространства</p>
              </div>
            </div>

            {/* Информационный плашка-баннер */}
            <div className="p-3.5 bg-orange-500/5 border border-orange-500/10 rounded-xl">
              <p className="text-orange-400 text-[11px] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                Space Hub — скоро здесь появятся ваши комнаты!
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Homepage;