import React from 'react';
import useAuthStore from '../../store/useAuthStore';

const Header = () => {
  const { user } = useAuthStore();

  return (
    <header className="bg-[#030712] border-b border-white/10 p-4 flex justify-between items-center">
      <h2 className="text-xl font-bold">
        <span className="text-white">Nor</span>
        <span style={{ color: '#f97316' }}>Chat</span>
      </h2>
      <div className="flex items-center gap-3">
        <span className="text-white/60">👋 {user?.nickname}</span>
        <div className="w-10 h-10 rounded-full bg-[#f97316]/20 border border-[#f97316]/40 flex items-center justify-center">
          {user?.nickname?.[0] || 'U'}
        </div>
      </div>
    </header>
  );
};

export default Header;
