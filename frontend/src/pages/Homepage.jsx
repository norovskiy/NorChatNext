import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, Settings, Users, MessageSquare, Sparkles, Zap } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { StarsBackground } from '../components/Background/StarsBackgroundDemo';

const Homepage = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuthStore();
  
  const [showAnimation, setShowAnimation] = useState(() => {
    const saved = localStorage.getItem('norchat_bg_animation');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleBackground = () => {
    const newState = !showAnimation;
    setShowAnimation(newState);
    localStorage.setItem('norchat_bg_animation', String(newState));
  };

  return (
    <div className="relative min-h-screen bg-[#060608] text-white">
      {showAnimation && (
        <StarsBackground 
          starColor="#FFFFFF"
          factor={0.06}
          speed={0.6}
          className="absolute inset-0 w-full h-full"
        />
      )}

      <div className="absolute w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[150px] pointer-events-none -z-0" />

      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="border-b border-zinc-800/90 px-4 sm:px-6 lg:px-8 py-3.5 bg-[#060608]/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-black tracking-tight">
              <span className="text-white">Nor</span>
              <span className="text-orange-500 drop-shadow-[0_0_12px_rgba(249,115,22,0.4)]">Chat</span>
            </h1>
            
            <div className="flex items-center gap-3">
              <button
                onClick={toggleBackground}
                className="px-3 py-1.5 text-[10px] bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-all flex items-center gap-1.5"
              >
                {showAnimation ? (
                  <>
                    <Zap size={13} className="text-orange-400" />
                    Фон вкл
                  </>
                ) : (
                  <>
                    <Sparkles size={13} className="text-zinc-400" />
                    Фон выкл
                  </>
                )}
              </button>
              
              <div className="flex items-center gap-2.5">
                <span className="text-zinc-400 text-xs">
                  {user?.nickname || user?.username || 'User'}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3.5 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-[10px] hover:bg-red-500/20 transition-all flex items-center gap-1.5"
                >
                  <LogOut size={13} />
                  Выйти
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-[#141418] border border-zinc-800/90 rounded-2xl p-5 backdrop-blur-sm mb-5">
              <h2 className="text-base font-semibold text-white">
                Добро пожаловать, {user?.nickname || user?.username || 'User'}! 👋
              </h2>
              <p className="text-zinc-400 text-xs mt-0.5">Главная страница NorChat</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div className="bg-[#141418] border border-zinc-800/90 rounded-2xl p-5 hover:bg-zinc-800/30 transition-all cursor-pointer">
                <div className="text-2xl mb-2">💬</div>
                <h3 className="text-sm font-semibold text-white">Чаты</h3>
                <p className="text-zinc-400 text-[11px] mt-0.5">Активные чаты</p>
              </div>

              <div className="bg-[#141418] border border-zinc-800/90 rounded-2xl p-5 hover:bg-zinc-800/30 transition-all cursor-pointer">
                <div className="text-2xl mb-2">👥</div>
                <h3 className="text-sm font-semibold text-white">Друзья</h3>
                <p className="text-zinc-400 text-[11px] mt-0.5">Онлайн друзья</p>
              </div>

              <div className="bg-[#141418] border border-zinc-800/90 rounded-2xl p-5 hover:bg-zinc-800/30 transition-all cursor-pointer">
                <div className="text-2xl mb-2">🚀</div>
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