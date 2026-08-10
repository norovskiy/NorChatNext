import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const Homepage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            <span className="text-white">Nor</span>
            <span style={{ color: '#f97316' }}>Chat</span>
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-white/60">
              👋 {user?.nickname || 'User'}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/20 border border-red-500/40 rounded-xl text-red-200 hover:bg-red-500/30 transition-all"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
          <h2 className="text-2xl font-semibold mb-4">🏠 Homepage</h2>
          <p className="text-white/60">
            Welcome to NorChat! This is your homepage.
          </p>
          <div className="mt-6 p-4 bg-[#f97316]/10 border border-[#f97316]/20 rounded-xl">
            <p className="text-[#f97316]">🚀 Space Hub coming soon!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;