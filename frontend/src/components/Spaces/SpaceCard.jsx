import React from 'react';

const SpaceCard = ({ space }) => {
  return (
    <div className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-white font-semibold"># {space.name}</h3>
          <p className="text-white/40 text-sm">{space.members} members</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="text-white/40 text-sm">{space.online} online</span>
        </div>
      </div>
    </div>
  );
};

export default SpaceCard;