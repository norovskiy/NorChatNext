import React from 'react';
import useAuthStore from '../store/useAuthStore';

export default function Chat() {
  const { user, logout } = useAuthStore();

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-zinc-950 text-white">
      <h1 className="text-2xl font-bold">Добро пожаловать в NorChat, {user?.nickname || user?.username}!</h1>
      <button 
        onClick={logout}
        className="mt-4 rounded-lg bg-red-600 px-4 py-2 hover:bg-red-700"
      >
        Выйти
      </button>
    </div>
  );
}