import React from 'react';

const FriendList = () => {
  const friends = [
    { id: 1, name: 'Alice', online: true },
    { id: 2, name: 'Bob', online: false },
    { id: 3, name: 'Charlie', online: true },
  ];

  return (
    <div className="space-y-2">
      {friends.map((friend) => (
        <div key={friend.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-[#f97316]/20 border border-[#f97316]/40 flex items-center justify-center">
              {friend.name[0]}
            </div>
            {friend.online && (
              <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#030712]"></div>
            )}
          </div>
          <span className="text-white">{friend.name}</span>
        </div>
      ))}
    </div>
  );
};

export default FriendList;