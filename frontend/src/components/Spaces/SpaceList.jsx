import React, { useState } from 'react';

const SpaceList = () => {
  const [spaces] = useState([
    { id: 1, name: 'General', members: 42, online: 12 },
    { id: 2, name: 'Tech Talks', members: 28, online: 8 },
    { id: 3, name: 'Gaming', members: 15, online: 5 },
  ]);

  return (
    <div className="space-y-3">
      {spaces.map((space) => (
        <div key={space.id} className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
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
      ))}
    </div>
  );
};

export default SpaceList;