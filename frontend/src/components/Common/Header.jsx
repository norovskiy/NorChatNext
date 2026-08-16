import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { 
  Heart, 
  Coins, 
  ShieldCheck, 
  Sparkles, 
  Crown, 
  Zap, 
  LogOut, 
  Bell, 
  User as UserIcon,
  ShoppingBag
} from 'lucide-react';

// 📂 Положи локальное видео в src/assets/banner.mp4 и раскомментируй строчку ниже:
// import defaultBannerVideo from '../../assets/banner.mp4';

// Дефолтная рамка — та же палитра, что дефолтная рамка в Profile (frame_gold_spin),
// чтобы аватар выглядел одинаково, пока юзер не экипировал купленную в сторе рамку.
const DEFAULT_FRAME = 'from-amber-400 via-orange-500 to-yellow-300';

const Header = ({ showAnimation, toggleBackground }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [isHovered, setIsHovered] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const hoverTimeoutRef = useRef(null);
  const notificationRef = useRef(null);

  // Переменная для медиа (локальный файл, из БД юзера или null)
  const bannerMedia = user?.banner /* || defaultBannerVideo */; 
  const isVideo = bannerMedia?.endsWith?.('.mp4') || bannerMedia?.endsWith?.('.webm');

  // Рамка аватара — берём то, что юзер реально экипировал в сторе (см. Profile.jsx),
  // а не хардкодим один и тот же градиент везде.
  const avatarFrame = user?.avatarFrame || DEFAULT_FRAME;

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 200);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const nickname = user?.nickname || 'axmed';
  const username = user?.username || 'axmed';

  // Реальная проверка подписки — раньше тут был "|| true", который навсегда
  // прятал кнопку "Купить VIP" даже для юзеров без подписки. Убрано.
  const isVipOrPremium = user?.subscription?.plan === 'vip' || user?.subscription?.plan === 'premium';

  const notifications = [
    { id: 1, title: 'Новый лайк!', desc: 'Алексей поставил вам лайк ❤️', time: '5м назад', unread: true },
    { id: 2, title: 'Добро пожаловать', desc: 'Успешный вход в NorChat 🚀', time: '1ч назад', unread: false },
  ];

  return (
    <header className="bg-[#060608]/80 border-b border-white/10 px-6 py-3 flex justify-between items-center relative z-50 backdrop-blur-sm select-none">
      {/* Логотип */}
      <div 
        className="flex items-center gap-2 cursor-pointer" 
        onClick={() => navigate('/')}
      >
        <h2 className="text-2xl font-black tracking-tight">
          <span className="text-white">Nor</span>
          <span className="text-[#f97316] drop-shadow-[0_0_12px_rgba(249,115,22,0.4)]">Chat</span>
        </h2>
      </div>

      {/* Правая панель */}
      <div className="flex items-center gap-3">
        {/* Кнопка переключения фона */}
        {toggleBackground && (
          <button
            onClick={toggleBackground}
            className="px-2 py-2 text-[11px] bg-white/[0.03] border border-white/10 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5"
          >
            {showAnimation ? (
              <>
                <Zap size={18} className="text-orange-400 fill-orange-400" />
              </>
            ) : (
              <>
                <Sparkles size={18} className="text-zinc-400" />
              </>
            )}
          </button>
        )}

        {/* Уведомления */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 bg-white/[0.03] border border-white/10 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 transition-all"
            title="Уведомления"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#f97316] rounded-full animate-pulse"></span>
          </button>

          {/* Всплывающее окно уведомлений */}
          <div 
            className={`absolute right-0 top-full mt-2 w-80 bg-[#0b0f17]/95 border border-white/15 rounded-2xl shadow-2xl backdrop-blur-xl p-4 text-white z-50 transition-all duration-200 ease-out transform ${
              showNotifications 
                ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' 
                : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
            }`}
          >
            <div className="flex justify-between items-center pb-2.5 border-b border-white/10 mb-3">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Bell size={14} className="text-[#f97316]" /> Уведомления
              </h3>
              <span className="text-[10px] bg-[#f97316]/20 text-[#f97316] px-2 py-0.5 rounded-full border border-[#f97316]/30 font-medium">
                2 новых
              </span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`p-2.5 rounded-xl border text-xs transition-colors ${
                    n.unread ? 'bg-white/5 border-orange-500/30' : 'bg-transparent border-white/5 opacity-60'
                  }`}
                >
                  <div className="flex justify-between font-medium text-white mb-0.5">
                    <span>{n.title}</span>
                    <span className="text-[10px] text-white/40">{n.time}</span>
                  </div>
                  <p className="text-white/60 text-[11px]">{n.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Профиль пользователя */}
        <div 
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Аватар в панели шапки */}
          <div 
            onClick={() => navigate('/profile')}
            className="flex items-center gap-3 cursor-pointer group p-1 px-2.5 rounded-2xl hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-white/10"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full p-[2px] relative flex items-center justify-center">
                <div className={`absolute inset-0 rounded-full bg-gradient-to-tr ${avatarFrame} animate-spin-slow opacity-90`}></div>
                
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={nickname}
                    className="w-full h-full rounded-full object-cover bg-neutral-900 relative z-10"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-[#0b0f17] flex items-center justify-center font-extrabold text-white text-base relative z-10">
                    {nickname[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#060608] rounded-full z-20"></span>
            </div>

            <div className="flex flex-col text-left">
              <span className="text-white font-bold text-sm leading-snug group-hover:text-[#f97316] transition-colors flex items-center gap-1">
                {nickname}
                {user?.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-[#f97316]" />}
              </span>
              <span className="text-white/40 text-xs font-medium -mt-0.5">
                @{username}
              </span>
            </div>
          </div>

          {/* Hover-карточка профиля — тот же язык, что и в Profile: компактный баннер + аватар внахлёст */}
          <div 
            className={`absolute right-0 top-full mt-2 w-80 bg-[#0b0f17]/95 border border-white/15 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden text-white z-50 transition-all duration-300 ease-out transform ${
              isHovered 
                ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' 
                : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
            }`}
          >
            {/* Блок Баннера: только оранжевая палитра, без фиолетового, с fade-швом к телу карточки */}
            <div className="h-24 w-full relative overflow-hidden p-3 flex justify-between items-start bg-gradient-to-br from-orange-600/25 via-[#0b0f17] to-amber-500/20">
              
              {/* Если загружено видео */}
              {bannerMedia && isVideo && (
                <video
                  src={bannerMedia}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover z-0 opacity-80"
                />
              )}

              {/* Если загружена статичная картинка */}
              {bannerMedia && !isVideo && (
                <img 
                  src={bannerMedia} 
                  alt="Banner" 
                  className="absolute inset-0 w-full h-full object-cover z-0 opacity-80" 
                />
              )}

              {/* Затемнение + шов к телу карточки (тот же приём, что в Profile) */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-[#0b0f17] z-[1]"></div>

              {/* Бейджи */}
              <div className="relative z-10 flex justify-between items-start w-full">
                <span className="bg-black/60 backdrop-blur-md text-[#f97316] border border-[#f97316]/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Lv. {user?.level || 1}
                </span>

                {isVipOrPremium ? (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/50 backdrop-blur-md text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                    <Crown className="w-3 h-3 text-amber-400 fill-amber-400" /> 
                    VIP
                  </span>
                ) : (
                  <button 
                    onClick={() => navigate('/store')}
                    className="bg-white/10 hover:bg-[#f97316]/20 text-white/80 hover:text-[#f97316] border border-white/10 hover:border-[#f97316]/40 backdrop-blur-md text-[10px] font-semibold px-2 py-0.5 rounded-full transition-all flex items-center gap-1"
                  >
                    <ShoppingBag className="w-3 h-3" /> Купить VIP
                  </button>
                )}
              </div>
            </div>

            {/* Карточка профиля */}
            <div className="px-5 pb-5 pt-0 relative">
              <div className="flex justify-between items-end -mt-10 mb-3 z-10 relative">
                <div 
                  onClick={() => navigate('/profile')}
                  className="relative w-20 h-20 rounded-full flex items-center justify-center cursor-pointer group"
                >
                  <div className={`absolute -inset-1 rounded-full bg-gradient-to-tr ${avatarFrame} animate-spin-slow opacity-90 blur-[1px]`}></div>

                  <div className="w-16 h-16 rounded-full border-2 border-[#0b0f17] bg-[#161b26] overflow-hidden relative z-10">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={nickname} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-xl text-white bg-zinc-900">
                        {nickname[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 px-3 py-1 rounded-xl text-xs font-bold mb-1">
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  <span>{user?.likesCount || user?.likes || 0}</span>
                  <span className="text-[10px] text-rose-300/70 font-normal">лайков</span>
                </div>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-base text-white">{nickname}</h4>
                  {user?.isVerified && <ShieldCheck className="w-4 h-4 text-[#f97316]" />}
                </div>
                <p className="text-xs text-white/40 font-medium">@{username}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/10 text-xs">
                <div className="flex items-center gap-2 bg-white/[0.03] p-2 rounded-xl border border-white/10">
                  <Coins className="w-4 h-4 text-orange-400" />
                  <div>
                    <div className="text-[10px] text-white/40">Монеты</div>
                    <div className="font-bold text-orange-400">{user?.norCoins || 200} NC</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-white/[0.03] p-2 rounded-xl border border-white/10">
                  <div className="w-4 h-4 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[9px]">
                    🌍
                  </div>
                  <div>
                    <div className="text-[10px] text-white/40">Регион</div>
                    <div className="font-semibold text-white truncate max-w-[80px]">
                      {user?.region || 'International'}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/profile')}
                className="w-full mt-3 py-2 bg-[#f97316]/10 hover:bg-[#f97316]/20 border border-[#f97316]/30 text-[#f97316] font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <UserIcon size={14} /> Мой Профиль
              </button>
            </div>
          </div>
        </div>

        {/* Выход */}
        <button
          onClick={handleLogout}
          className="p-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all flex items-center justify-center"
          title="Выйти"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
};

export default Header;