import React, { useState } from 'react';
import { Users, MessageSquare, Rocket } from 'lucide-react';
import useAuthStore from '../store/useAuthstore';
import { StarsBackground } from '../components/Background/StarsBackgroundDemo';
import Header from '../components/Common/Header'; // Импортируем наш собственный Header

const Homepage = () => {
  const { user } = useAuthStore();

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

  const displayName = user?.nickname || user?.username || 'Пользователь';

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
        {/* Вызываем наш единый Header */}
        <Header showAnimation={showAnimation} toggleBackground={toggleBackground} />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-[#141418] border border-zinc-800/90 rounded-2xl p-5 backdrop-blur-sm mb-5">
              <h2 className="text-base font-semibold text-white">
                Добро пожаловать, {displayName}! 👋
              </h2>
              <p className="text-zinc-400 text-xs mt-0.5">Главная страница NorChat</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div className="bg-[#141418] border border-zinc-800/90 rounded-2xl p-5 hover:bg-zinc-800/30 transition-all cursor-pointer group">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <MessageSquare size={20} />
                </div>
                <h3 className="text-sm font-semibold text-white">Чаты</h3>
                <p className="text-zinc-400 text-[11px] mt-0.5">Активные диалоги</p>
              </div>

              <div className="bg-[#141418] border border-zinc-800/90 rounded-2xl p-5 hover:bg-zinc-800/30 transition-all cursor-pointer group">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Users size={20} />
                </div>
                <h3 className="text-sm font-semibold text-white">Друзья</h3>
                <p className="text-zinc-400 text-[11px] mt-0.5">Онлайн список</p>
              </div>

              <div className="bg-[#141418] border border-zinc-800/90 rounded-2xl p-5 hover:bg-zinc-800/30 transition-all cursor-pointer group">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Rocket size={20} />
                </div>
                <h3 className="text-sm font-semibold text-white">Spaces</h3>
                <p className="text-zinc-400 text-[11px] mt-0.5">Ваши пространства</p>
              </div>
            </div>

            <div className="mt-5 p-3.5 bg-orange-500/5 border border-orange-500/10 rounded-xl">
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