import React from 'react';

const OnlineStatus = ({ isOnline }) => {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-gray-500'}`}></span>
      <span className="text-white/40 text-sm">
        {isOnline ? 'Online' : 'Offline'}
      </span>
    </div>
  );
};

export default OnlineStatus;