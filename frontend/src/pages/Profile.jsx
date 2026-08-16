import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { 
  Heart, 
  Coins, 
  ShieldCheck, 
  Sparkles, 
  Crown, 
  User as UserIcon,
  Edit3,
  Package,
  X,
  Check,
  ArrowLeft,
  Grid,
  Award
} from 'lucide-react';

const INVENTORY_ITEMS = {
  banners: [
    {
      id: 'banner_cyber',
      name: 'Cyber Neon Pulse',
      type: 'video',
      rarity: 'VIP',
      rarityColor: 'border-amber-500 text-amber-400 bg-amber-500/10',
      src: 'https://assets.mixkit.co/videos/preview/mixkit-glowing-lines-in-a-dark-background-40081-large.mp4',
    },
    {
      id: 'banner_matrix',
      name: 'Matrix Code',
      type: 'video',
      rarity: 'Legendary',
      rarityColor: 'border-yellow-400 text-yellow-400 bg-yellow-400/10',
      src: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-code-41538-large.mp4',
    },
    {
      id: 'banner_purple',
      name: 'Purple Nebulae',
      type: 'image',
      rarity: 'Epic',
      rarityColor: 'border-purple-400 text-purple-400 bg-purple-400/10',
      src: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&q=80',
    },
    {
      id: 'banner_minimal',
      name: 'Dark Sunset',
      type: 'image',
      rarity: 'Common',
      rarityColor: 'border-zinc-500 text-zinc-400 bg-zinc-500/10',
      src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&q=80',
    }
  ],
  frames: [
    {
      id: 'frame_gold_spin',
      name: 'Golden Dragon Ring',
      gradient: 'from-amber-400 via-orange-500 to-yellow-300',
    },
    {
      id: 'frame_neon_purple',
      name: 'Cyber Violet Ring',
      gradient: 'from-purple-500 via-indigo-500 to-pink-500',
    },
    {
      id: 'frame_emerald',
      name: 'Emerald Flame',
      gradient: 'from-emerald-400 via-teal-500 to-cyan-500',
    }
  ],
  titles: [
    { id: 'title_active', name: '⚡ Активный User', color: 'from-amber-400 via-yellow-200 to-orange-500', border: 'border-amber-400/50' },
    { id: 'title_legend', name: '🔥 Легенда Чата', color: 'from-rose-500 via-purple-300 to-indigo-500', border: 'border-rose-500/50' },
    { id: 'title_vip', name: '👑 Магнат NorChat', color: 'from-yellow-300 via-amber-100 to-yellow-500', border: 'border-yellow-400/50' },
  ]
};

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [profileTab, setProfileTab] = useState('inventory');
  const [activeEditTab, setActiveEditTab] = useState('inventory');
  const [inventoryCategory, setInventoryCategory] = useState('banners');

  const [nickname, setNickname] = useState(user?.nickname || 'axmed');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
  const [equippedBanner, setEquippedBanner] = useState(user?.banner || INVENTORY_ITEMS.banners[0].src);
  const [equippedFrame, setEquippedFrame] = useState(user?.avatarFrame || INVENTORY_ITEMS.frames[0].gradient);
  const [equippedTitle, setEquippedTitle] = useState(user?.title || INVENTORY_ITEMS.titles[0]);

  const isVipOrPremium = user?.subscription?.plan === 'vip' || user?.subscription?.plan === 'premium' || true;
  const isVideoBanner = equippedBanner?.endsWith?.('.mp4') || equippedBanner?.includes?.('mixkit');

  const handleSaveProfile = () => {
    if (updateUser) {
      updateUser({
        nickname,
        avatar: avatarUrl,
        banner: equippedBanner,
        avatarFrame: equippedFrame,
        title: equippedTitle,
      });
    }
    setIsEditOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#060608] text-white p-2 sm:p-4 md:p-6 pb-20 select-none">
      <style>{`
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-shine {
          animation: shine 2.5s infinite linear;
        }
      `}</style>

      <div className="max-w-[1100px] mx-auto space-y-6">

        {/* ================= PROFILE CARD ================= */}
        <div className="relative w-full rounded-3xl overflow-hidden border border-white/10 bg-zinc-950 shadow-2xl">

          {/* ---- Banner ---- */}
          <div className="relative w-full h-52 sm:h-64 md:h-72">
            <div className="absolute inset-0">
              {isVideoBanner ? (
                <video
                  src={equippedBanner}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={equippedBanner}
                  alt="Profile Background"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/40"></div>
            </div>

            {/* Top Bar */}
            <div className="relative z-10 h-full flex items-start justify-between p-4 sm:p-5">
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-black/40 hover:bg-black/60 backdrop-blur-xl border border-white/15 rounded-2xl text-zinc-300 hover:text-white transition-all flex items-center gap-2 text-xs font-bold shadow-lg"
              >
                <ArrowLeft size={16} /> На главную
              </button>

              <div className="flex items-center gap-2">
                <span className="bg-black/50 backdrop-blur-md text-[#f97316] border border-[#f97316]/40 text-xs font-extrabold px-3.5 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-lg">
                  <Sparkles className="w-4 h-4" /> Lv. {user?.level || 1}
                </span>

                {isVipOrPremium && (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/50 backdrop-blur-md text-xs font-black px-3.5 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                    <Crown className="w-4 h-4 text-amber-400 fill-amber-400" /> VIP
                  </span>
                )}

                <button
                  onClick={() => setIsEditOpen(true)}
                  className="px-4 py-2 bg-[#f97316] hover:bg-orange-600 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-orange-500/25"
                >
                  <Edit3 size={15} /> Редактировать
                </button>
              </div>
            </div>
          </div>

          {/* ---- Body ---- */}
          <div className="relative bg-zinc-950 px-5 sm:px-8 pb-6">

            {/* Avatar centered EXACTLY 50/50 on boundary line:
                Avatar height is 112px (h-28) on mobile, 144px (h-36) on desktop.
                -mt-14 (56px) / -mt-18 (72px) centers it precisely on the line. */}
            <div className="relative z-20 flex items-end justify-between flex-wrap gap-4 mb-4">
              <div className="flex items-end gap-5">
                
                {/* Аватарка (50% сверху на фоне, 50% снизу) */}
                <div className="relative w-28 h-28 sm:w-36 sm:h-36 -mt-14 sm:-mt-18 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className={`absolute -inset-1.5 rounded-full bg-gradient-to-tr ${equippedFrame} animate-spin-slow opacity-90 blur-[2px]`}></div>
                  <div className="w-[104px] h-[104px] sm:w-[136px] sm:h-[136px] rounded-full border-4 border-zinc-950 bg-[#060608] overflow-hidden relative z-10 shadow-2xl">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={nickname} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-black text-2xl sm:text-3xl text-white bg-zinc-900">
                        {nickname[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Никнейм и инфо подтягиваются рядом */}
                <div className="pt-3 sm:pt-4 space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      {nickname}
                    </h1>
                    {user?.isVerified && (
                      <ShieldCheck className="w-5 h-5 text-[#f97316] drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                    )}

                    {equippedTitle && (
                      <div className={`relative overflow-hidden px-3 py-0.5 rounded-xl border bg-black/70 backdrop-blur-md ${equippedTitle.border} shadow-[0_0_15px_rgba(251,191,36,0.2)] flex items-center gap-1.5`}>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-75 -skew-x-12 animate-shine pointer-events-none"></div>
                        <span className={`text-[11px] font-black bg-gradient-to-r ${equippedTitle.color} bg-clip-text text-transparent uppercase tracking-wider`}>
                          {equippedTitle.name}
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-zinc-400">
                    @{user?.username || nickname}
                  </p>
                </div>
              </div>
            </div>

            {/* Bio + followers */}
            <div className="space-y-2 mb-5">
              <p className="text-xs sm:text-sm text-zinc-400 max-w-lg leading-relaxed">
                Участник NorChat • Полноценный доступ ко всем функциям и видео-комнатам.
              </p>
              <div className="flex items-center gap-5 text-xs font-bold text-zinc-200">
                <div className="flex items-center gap-1.5">
                  <span className="text-white text-sm font-black">1.2k</span>
                  <span className="text-zinc-400 font-medium">подписчиков</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-zinc-600"></div>
                <div className="flex items-center gap-1.5">
                  <span className="text-white text-sm font-black">340</span>
                  <span className="text-zinc-400 font-medium">подписок</span>
                </div>
              </div>
            </div>

            {/* Stats cards */}
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              <div className="bg-white/[0.03] border border-white/10 p-3.5 px-5 rounded-2xl flex items-center gap-3 shadow-xl min-w-[120px]">
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
                  <Heart className="w-5 h-5 fill-rose-500" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">Лайки</div>
                  <div className="text-lg font-black text-white">{user?.likesCount || user?.likes || 0}</div>
                </div>
              </div>

              <div className="bg-white/[0.03] border border-white/10 p-3.5 px-5 rounded-2xl flex items-center gap-3 shadow-xl min-w-[130px]">
                <div className="p-2.5 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-400">
                  <Coins className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">Баланс</div>
                  <div className="text-lg font-black text-orange-400">{user?.norCoins || 200} NC</div>
                </div>
              </div>

              <div className="bg-white/[0.03] border border-white/10 p-3.5 px-5 rounded-2xl flex items-center gap-3 shadow-xl min-w-[130px]">
                <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-base">
                  🌍
                </div>
                <div className="text-left">
                  <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">Регион</div>
                  <div className="text-sm font-black text-white truncate max-w-[90px]">
                    {user?.region || 'International'}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ================= LOWER NAVIGATION TABS ================= */}
        <div className="flex justify-center border-b border-white/10 pt-2">
          <button
            onClick={() => setProfileTab('inventory')}
            className={`py-3.5 px-8 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              profileTab === 'inventory' 
                ? 'border-[#f97316] text-[#f97316]' 
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Package size={16} /> Предметы и Оформление
          </button>

          <button
            onClick={() => setProfileTab('stats')}
            className={`py-3.5 px-8 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              profileTab === 'stats' 
                ? 'border-[#f97316] text-[#f97316]' 
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Award size={16} /> Статистика Чатов
          </button>
        </div>

        {/* Tab Content */}
        <div className="py-4">
          {profileTab === 'inventory' ? (
            <div className="space-y-5 text-left">
              <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                <Grid size={16} className="text-[#f97316]" /> Эксклюзивные темы и эффекты
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {INVENTORY_ITEMS.banners.map((item) => (
                  <div 
                    key={item.id}
                    className={`rounded-2xl border bg-zinc-900/50 p-3 relative overflow-hidden transition-all ${
                      equippedBanner === item.src ? 'border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.15)]' : 'border-white/10'
                    }`}
                  >
                    <div className="h-28 w-full rounded-xl overflow-hidden relative bg-black mb-3">
                      {item.type === 'video' ? (
                        <video src={item.src} autoPlay loop muted className="w-full h-full object-cover" />
                      ) : (
                        <img src={item.src} alt={item.name} className="w-full h-full object-cover" />
                      )}
                      <span className={`absolute top-2 left-2 text-[10px] font-black px-2 py-0.5 rounded-md border backdrop-blur-md ${item.rarityColor}`}>
                        {item.rarity}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white">{item.name}</span>
                      <button 
                        onClick={() => setEquippedBanner(item.src)}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                          equippedBanner === item.src 
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' 
                            : 'bg-white/5 hover:bg-white/10 text-zinc-300'
                        }`}
                      >
                        {equippedBanner === item.src ? 'Надето' : 'Выбрать'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <div className="bg-zinc-900/50 border border-white/10 p-5 rounded-2xl">
                <p className="text-xs text-zinc-400">Всего видеочатов</p>
                <p className="text-2xl font-black text-white mt-1">124 сессии</p>
              </div>
              <div className="bg-zinc-900/50 border border-white/10 p-5 rounded-2xl">
                <p className="text-xs text-zinc-400">Рейтинг симпатий</p>
                <p className="text-2xl font-black text-rose-400 mt-1">98.4%</p>
              </div>
              <div className="bg-zinc-900/50 border border-white/10 p-5 rounded-2xl">
                <p className="text-xs text-zinc-400">Статус аккаунта</p>
                <p className="text-2xl font-black text-amber-400 mt-1">VIP Premium</p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ================= EDIT MODAL ================= */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b0f17] border border-white/15 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            
            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#f97316]" />
                <h3 className="font-bold text-base text-white">Настройки профиля</h3>
              </div>
              <button 
                onClick={() => setIsEditOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-white/10 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex border-b border-white/10 bg-black/40 p-1">
              <button
                onClick={() => setActiveEditTab('inventory')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  activeEditTab === 'inventory' 
                    ? 'bg-[#f97316] text-white' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Package size={14} /> Оформление
              </button>
              <button
                onClick={() => setActiveEditTab('general')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  activeEditTab === 'general' 
                    ? 'bg-[#f97316] text-white' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <UserIcon size={14} /> Личные данные
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {activeEditTab === 'inventory' ? (
                <div className="space-y-4">
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setInventoryCategory('banners')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        inventoryCategory === 'banners' ? 'bg-white/10 border-orange-500/50 text-orange-400' : 'bg-transparent border-white/5 text-zinc-400'
                      }`}
                    >
                      Фоны ({INVENTORY_ITEMS.banners.length})
                    </button>
                    <button
                      onClick={() => setInventoryCategory('frames')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        inventoryCategory === 'frames' ? 'bg-white/10 border-orange-500/50 text-orange-400' : 'bg-transparent border-white/5 text-zinc-400'
                      }`}
                    >
                      Рамки ({INVENTORY_ITEMS.frames.length})
                    </button>
                    <button
                      onClick={() => setInventoryCategory('titles')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        inventoryCategory === 'titles' ? 'bg-white/10 border-orange-500/50 text-orange-400' : 'bg-transparent border-white/5 text-zinc-400'
                      }`}
                    >
                      Титулы ({INVENTORY_ITEMS.titles.length})
                    </button>
                  </div>

                  {inventoryCategory === 'banners' && (
                    <div className="grid grid-cols-2 gap-3">
                      {INVENTORY_ITEMS.banners.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setEquippedBanner(item.src)}
                          className={`rounded-xl border p-2 cursor-pointer transition-all ${
                            equippedBanner === item.src ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 bg-white/5'
                          }`}
                        >
                          <div className="h-16 w-full rounded-lg overflow-hidden relative bg-black">
                            {item.type === 'video' ? (
                              <video src={item.src} autoPlay loop muted className="w-full h-full object-cover" />
                            ) : (
                              <img src={item.src} alt={item.name} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <p className="text-xs font-bold text-white mt-1.5 truncate">{item.name}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {inventoryCategory === 'frames' && (
                    <div className="grid grid-cols-2 gap-3">
                      {INVENTORY_ITEMS.frames.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setEquippedFrame(item.gradient)}
                          className={`rounded-xl border p-3 cursor-pointer transition-all flex items-center gap-3 ${
                            equippedFrame === item.gradient ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 bg-white/5'
                          }`}
                        >
                          <div className="relative w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                            <div className={`absolute -inset-1 rounded-full bg-gradient-to-tr ${item.gradient} animate-spin-slow`}></div>
                            <div className="w-8 h-8 rounded-full bg-zinc-900 relative z-10"></div>
                          </div>
                          <p className="text-xs font-bold text-white truncate">{item.name}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {inventoryCategory === 'titles' && (
                    <div className="grid grid-cols-1 gap-2.5">
                      {INVENTORY_ITEMS.titles.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setEquippedTitle(item)}
                          className={`rounded-xl border p-3 cursor-pointer transition-all flex items-center justify-between ${
                            equippedTitle?.id === item.id ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 bg-white/5'
                          }`}
                        >
                          <span className={`text-xs font-black bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                            {item.name}
                          </span>
                          <span className="text-[11px] font-bold text-zinc-400">
                            {equippedTitle?.id === item.id ? 'Выбрано' : 'Нажать'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4 text-left">
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Никнейм</label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:border-orange-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-400 block mb-1.5">Ссылка на Аватар (URL)</label>
                    <input
                      type="text"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:border-orange-500 outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/10 bg-zinc-900/50 flex justify-end gap-3">
              <button
                onClick={() => setIsEditOpen(false)}
                className="px-4 py-2 bg-white/5 text-zinc-300 text-xs font-semibold rounded-xl"
              >
                Отмена
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-5 py-2 bg-[#f97316] text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-1.5"
              >
                <Check size={14} /> Сохранить
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;