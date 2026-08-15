import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, 
  Users, 
  Sparkles, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft, 
  Zap, 
  Lock,
  ArrowRight,
  Radio,
  FileText,
  X,
  Check,
  Crown,
  Star,
  ListMusic,
  Play,
  Pause,
  AlertTriangle,
  UserX,
  ShieldAlert
} from 'lucide-react';
import { StarsBackground } from '../components/Background/StarsBackgroundDemo';

const RadixCheckboxDemo = ({ checked, onCheckedChange, label }) => {
  return (
    <label 
      className="flex items-center gap-x-3 cursor-pointer group select-none"
      role="checkbox"
      aria-checked={checked}
    >
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
          className="sr-only"
        />
        <motion.div
          whileTap={{ scale: 0.85 }}
          className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
            checked
              ? 'bg-gradient-to-tr from-orange-500 to-amber-500 border-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.4)]'
              : 'bg-[#141418] border-zinc-700 group-hover:border-zinc-500'
          }`}
        >
          {checked && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
            </motion.div>
          )}
        </motion.div>
      </div>
      <span className="text-xs text-zinc-300 font-medium group-hover:text-white transition-colors">
        {label}
      </span>
    </label>
  );
};

const MusicPreviewCard = () => {
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [activeTrack, setActiveTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioCtxRef = useRef(null);
  const oscillatorsRef = useRef([]);

  const playlist = [
    { title: 'Lo-Fi Cyber Chill', station: 'NorChat Wave Station', freqs: [261.63, 329.63, 392.00, 523.25] },
    { title: 'Night Drive Phonk', station: 'NorChat Energy', freqs: [220.00, 277.18, 329.63, 440.00] },
    { title: 'Acoustic Chillout', station: 'NorChat Lounge', freqs: [196.00, 246.94, 293.66, 392.00] }
  ];

  const stopAudio = () => {
    oscillatorsRef.current.forEach(osc => {
      try { osc.stop(); } catch(e) {}
    });
    oscillatorsRef.current = [];
  };

  const startAudio = (trackIndex) => {
    stopAudio();
    try {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const freqs = playlist[trackIndex].freqs;
      
      freqs.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(0.02, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 1);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        oscillatorsRef.current.push(osc);
      });
    } catch (e) {
      console.log('Audio autoplay prevented', e);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopAudio();
      setIsPlaying(false);
    } else {
      startAudio(activeTrack);
      setIsPlaying(true);
    }
  };

  const handleSelectTrack = (idx) => {
    setActiveTrack(idx);
    setShowPlaylist(false);
    startAudio(idx);
    setIsPlaying(true);
  };

  useEffect(() => {
    return () => {
      stopAudio();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return (
    <div className="relative w-full h-44 sm:h-52 bg-[#121217] rounded-2xl border border-zinc-800/90 p-3.5 flex flex-col justify-between overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center shadow-[0_0_18px_rgba(249,115,22,0.4)] text-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
          </button>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>{playlist[activeTrack].title}</span>
              {isPlaying && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />}
            </div>
            <div className="text-[10px] text-orange-400 font-medium">{playlist[activeTrack].station}</div>
          </div>
        </div>

        <button
          onClick={() => setShowPlaylist(!showPlaylist)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/25 text-orange-400 hover:bg-orange-500/20 text-[10px] font-bold transition-all cursor-pointer"
        >
          <ListMusic className="w-3.5 h-3.5" />
          <span>{showPlaylist ? 'Закрыть' : 'Треки'}</span>
        </button>
      </div>

      {showPlaylist ? (
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="my-1 space-y-1 bg-black/50 p-2 rounded-xl border border-white/5"
        >
          {playlist.map((track, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectTrack(idx)}
              className={`w-full flex items-center justify-between p-1.5 rounded-lg text-[10px] transition-all cursor-pointer ${
                activeTrack === idx 
                  ? 'bg-orange-500/20 text-orange-300 font-bold border border-orange-500/30' 
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{track.title}</span>
              {activeTrack === idx && isPlaying && <span className="text-orange-400 font-mono text-[9px]">● Играет</span>}
            </button>
          ))}
        </motion.div>
      ) : (
        <div className="flex items-end justify-between h-12 px-4 bg-black/40 rounded-xl border border-white/5 py-2 my-auto">
          {[40, 75, 30, 90, 60, 100, 45, 80, 55, 95, 35, 70].map((h, i) => (
            <motion.div
              key={i}
              animate={isPlaying ? { height: [`${h * 0.2}%`, `${h}%`, `${h * 0.3}%`] } : { height: '15%' }}
              transition={isPlaying ? { repeat: Infinity, duration: 0.8 + (i % 3) * 0.2, ease: 'easeInOut' } : { duration: 0.3 }}
              className="w-1.5 bg-gradient-to-t from-orange-600 to-amber-400 rounded-full"
            />
          ))}
        </div>
      )}

      <div className="text-[10px] text-zinc-400 text-center bg-white/[0.02] py-1 rounded-lg border border-white/5 flex items-center justify-center gap-1.5">
        <Sparkles className="w-3 h-3 text-orange-400" />
        <span>Нажми Play для прослушивания атмосферного фонового трека</span>
      </div>
    </div>
  );
};

const SLIDES = [
  {
    id: 'video-chat',
    badge: '🔥 Главная фишка',
    title: 'Анонимный Видеочат',
    subtitle: 'Мгновенные HD-видеозвонки с людьми со всего мира в один клик без задержек.',
    icon: Video,
    preview: (
      <div className="relative w-full h-44 sm:h-52 bg-[#121217] rounded-2xl border border-zinc-800/90 p-3 overflow-hidden flex flex-col justify-between shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono font-semibold text-emerald-400">LIVE • HD</span>
          </div>
          <div className="flex items-center gap-1.5 bg-orange-500/20 border border-orange-500/30 px-2.5 py-1 rounded-full text-orange-400 text-[10px] font-bold">
            <Radio className="w-3 h-3 animate-spin" />
            <span>Поиск собеседника</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 my-auto z-10">
          <div className="relative aspect-video rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/50 flex flex-col items-center justify-center overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white font-bold text-sm shadow-lg mb-1">
              User
            </div>
            <span className="text-[10px] text-zinc-400 font-medium">Собеседник</span>
            <div className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-zinc-900" />
          </div>

          <div className="relative aspect-video rounded-xl bg-gradient-to-br from-orange-950/40 via-zinc-900 to-zinc-900 border border-orange-500/40 flex flex-col items-center justify-center overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white font-bold text-sm shadow-[0_0_15px_rgba(249,115,22,0.5)] mb-1">
              Вы
            </div>
            <span className="text-[10px] text-orange-400 font-medium">Вы в эфире</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 z-10 text-[11px] text-zinc-400 bg-white/[0.03] py-1.5 rounded-xl border border-white/5">
          <Zap className="w-3.5 h-3.5 text-orange-400" />
          <span>Быстрое WebRTC подключение</span>
        </div>
      </div>
    )
  },
  {
    id: 'smart-match',
    badge: '🎯 Умный поиск',
    title: 'Точный Подбор',
    subtitle: 'Выбирай фильтры интересов, пол и страны, чтобы общаться с теми, кто интересен именно тебе.',
    icon: Users,
    preview: (
      <div className="relative w-full h-44 sm:h-52 bg-[#121217] rounded-2xl border border-zinc-800/90 p-4 flex flex-col justify-center gap-3 overflow-hidden shadow-2xl">
        <div className="text-[11px] font-semibold text-zinc-400">Выберите темы разговора:</div>
        <div className="flex flex-wrap gap-2">
          {[
            { name: '# Игры', active: true },
            { name: '# Музыка', active: true },
            { name: '# Фильмы', active: false },
            { name: '# Программирование', active: true },
            { name: '# Чат обо всем', active: false },
          ].map((tag, i) => (
            <motion.span 
              key={i}
              whileHover={{ scale: 1.05 }}
              className={`text-xs px-3 py-1.5 rounded-xl font-medium border transition-all ${
                tag.active 
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 border-orange-400 text-white shadow-[0_0_12px_rgba(249,115,22,0.35)]' 
                  : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-400'
              }`}
            >
              {tag.name}
            </motion.span>
          ))}
        </div>
        <div className="mt-1 p-2.5 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-between text-xs">
          <span className="text-zinc-300 font-medium">Регион поиска:</span>
          <span className="text-orange-400 font-bold">Весь мир 🌍</span>
        </div>
      </div>
    )
  },
  {
    id: 'vibes-music',
    badge: '✨ Вайб и Атмосфера',
    title: 'Фоновая Музыка',
    subtitle: 'Слушай атмосферные треки во время общения прямо внутри встроенного плеера.',
    icon: Sparkles,
    preview: <MusicPreviewCard />
  },
  {
    id: 'subscriptions',
    badge: '💎 Тарифные Планы',
    title: 'Преимущества Подписок',
    subtitle: 'Выбирай подходящий статус для полного контроля, безлимитного общения и поиска.',
    icon: Crown,
    preview: (
      <div className="relative w-full h-44 sm:h-52 bg-[#121217] rounded-2xl border border-zinc-800/90 p-2.5 flex flex-col justify-between overflow-hidden shadow-2xl">
        <div className="grid grid-cols-3 gap-1.5 my-auto">
          <div className="bg-zinc-900/90 border border-orange-500/30 rounded-xl p-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <Star className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-[9px] font-bold text-orange-400">PLUS</span>
              </div>
              <div className="text-[10px] font-black text-white">$2.99 / мес</div>
            </div>
            <div className="text-[8px] text-zinc-400 space-y-0.5 mt-2 border-t border-zinc-800 pt-1">
              <div>• Без рекламы</div>
              <div>• Оранжевый ник</div>
              <div>• Чат без лимитов</div>
              <div>• +100 монет</div>
            </div>
          </div>

          <div className="bg-gradient-to-b from-amber-950/40 via-zinc-900 to-zinc-900 border border-amber-500/60 rounded-xl p-2 flex flex-col justify-between relative shadow-[0_0_12px_rgba(245,158,11,0.2)]">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-500 text-[7px] font-black text-black px-1.5 py-0.2 rounded-full uppercase">
              POPULAR
            </div>
            <div>
              <div className="flex items-center justify-between mb-1 mt-0.5">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[9px] font-bold text-amber-400">VIP</span>
              </div>
              <div className="text-[10px] font-black text-amber-300">$3.99 / мес</div>
            </div>
            <div className="text-[8px] text-zinc-300 space-y-0.5 mt-2 border-t border-amber-500/20 pt-1">
              <div>• Фильтр пола</div>
              <div>• VIP рамка</div>
              <div>• Приоритет</div>
              <div>• +300 монет</div>
            </div>
          </div>

          <div className="bg-zinc-900/90 border border-purple-500/40 rounded-xl p-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[9px] font-bold text-purple-300">PREMIUM</span>
              </div>
              <div className="text-[10px] font-black text-white">$5.99 / мес</div>
            </div>
            <div className="text-[8px] text-zinc-400 space-y-0.5 mt-2 border-t border-zinc-800 pt-1">
              <div>• Инкогнито</div>
              <div>• Поиск по странам</div>
              <div>• HD/4K Стрим</div>
              <div>• +1000 монет</div>
            </div>
          </div>
        </div>

        <div className="text-[10px] text-zinc-400 text-center bg-white/[0.02] py-1 rounded-lg border border-white/5">
          Разблокируй полный функционал NorChat
        </div>
      </div>
    )
  },
  {
    id: 'vip-privacy',
    badge: '🛡️ Безопасность',
    title: 'Полная Анонимность',
    subtitle: 'Никакой передачи личных данных. Полный контроль приватности и моментальная смена комнаты.',
    icon: ShieldCheck,
    preview: (
      <div className="relative w-full h-44 sm:h-52 bg-[#121217] rounded-2xl border border-zinc-800/90 p-4 flex flex-col items-center justify-center gap-3 overflow-hidden shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.25)]">
          <Lock className="w-8 h-8 text-orange-400" />
        </div>
        <div className="text-center">
          <div className="text-sm font-bold text-white">Шифрование данных</div>
          <div className="text-xs text-zinc-400 mt-1">Твои звонки защищены и не сохраняются</div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-emerald-400 text-[11px] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Защита активности 24/7</span>
        </div>
      </div>
    )
  }
];

const Welcome = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);

  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setDirection(1);
      setCurrentSlide((prev) => prev + 1);
    } else {
      setIsPolicyOpen(true);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const handleCheckoutToHome = () => {
    if (isAccepted) {
      navigate('/');
    }
  };

  const slide = SLIDES[currentSlide];

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 120 : -120,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.35, ease: 'easeOut' }
    },
    exit: (dir) => ({
      x: dir < 0 ? 120 : -120,
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.25, ease: 'easeIn' }
    })
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060608] text-white flex items-center justify-center p-4 select-none">
      <StarsBackground 
        starColor="#FFFFFF"
        factor={0.08}
        speed={0.8}
        className="absolute inset-0 w-full h-full opacity-60 pointer-events-none"
      />

      <div className="absolute w-[450px] h-[450px] bg-orange-500/15 rounded-full blur-[140px] pointer-events-none -z-0" />

      <div className="relative z-10 w-full max-w-[430px]">
        <div className="relative bg-[#0C0C0E]/95 backdrop-blur-2xl border border-zinc-800/90 rounded-3xl p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden">
          
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-90" />

          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-500 flex items-center justify-center shadow-[0_0_18px_rgba(249,115,22,0.4)]">
                <span className="text-xl font-black text-white tracking-wider">N</span>
              </div>
              <span className="text-lg font-black tracking-tight text-white">
                Nor<span className="text-orange-500 drop-shadow-[0_0_12px_rgba(249,115,22,0.5)]">Chat</span>
              </span>
            </div>

            <button
              onClick={() => setIsPolicyOpen(true)}
              className="text-xs text-orange-400 font-semibold hover:text-orange-300 transition-colors px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 cursor-pointer flex items-center gap-1"
            >
              <span>На главную</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="min-h-[350px] flex flex-col justify-between">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={slide.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-4"
              >
                {slide.preview}

                <div className="pt-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[11px] font-semibold mb-2">
                    {slide.badge}
                  </div>
                  <h2 className="text-xl font-black text-white tracking-tight">
                    {slide.title}
                  </h2>
                  <p className="text-zinc-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
                    {slide.subtitle}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="pt-6 flex items-center justify-between border-t border-zinc-800/80 mt-4">
              <div className="flex items-center gap-1.5">
                {SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setDirection(idx > currentSlide ? 1 : -1);
                      setCurrentSlide(idx);
                    }}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      idx === currentSlide
                        ? 'w-6 bg-gradient-to-r from-orange-500 to-amber-500'
                        : 'w-2 bg-zinc-700 hover:bg-zinc-500'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                {currentSlide > 0 && (
                  <button
                    onClick={handlePrev}
                    className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-white transition-all border border-zinc-700 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={handleNext}
                  className="px-4 py-2.5 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-[0_4px_20px_rgba(249,115,22,0.4)] flex items-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <span>{currentSlide === SLIDES.length - 1 ? 'Начать общение' : 'Далее'}</span>
                  {currentSlide === SLIDES.length - 1 ? (
                    <ArrowRight className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      <AnimatePresence>
        {isPolicyOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg bg-[#0C0C0E] border border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent" />

              <div className="flex items-center justify-between mb-5 border-b border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2.5 text-orange-400 font-bold text-base">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-white">Правила Сообщества и Условия</span>
                </div>
                <button
                  onClick={() => setIsPolicyOpen(false)}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="h-64 sm:h-72 overflow-y-auto pr-3 space-y-4 text-xs text-zinc-400 scrollbar-thin scrollbar-thumb-orange-500/20 scrollbar-track-transparent">
                <div className="p-3 bg-orange-500/5 border border-orange-500/20 rounded-2xl text-zinc-300 space-y-1">
                  <div className="font-bold text-white text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-orange-400" />
                    <span>Добро пожаловать в NorChat!</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-zinc-400">
                    Чтобы сохранить комфортную, безопасную и анонимную атмосферу для всех участников, ознакомьтесь с подробным сводом правил сервиса.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="font-bold text-white text-xs flex items-center gap-1.5 text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>1. Категорически запрещено во время видеозвонков:</span>
                  </div>
                  <ul className="space-y-1.5 pl-2 text-zinc-300">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500 font-bold">•</span>
                      <span>Любые формы оскорблений, нецензурная брань, мат и агрессивное поведение.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500 font-bold">•</span>
                      <span>Демонстрация контента 18+ (порнография, нагота, шок-контент, жестокость).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500 font-bold">•</span>
                      <span>Травля, преследование, разжигание ненависти по национальным, религиозным и иным признакам.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500 font-bold">•</span>
                      <span>Реклама, спам, распространение вредоносных ссылок и мошеннические действия.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500 font-bold">•</span>
                      <span>Порча работы сервиса, использование ботов или скриптов обхода фильтрации.</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-2 pt-1 border-t border-zinc-800/60">
                  <div className="font-bold text-white text-xs flex items-center gap-1.5 text-emerald-400">
                    <Lock className="w-3.5 h-3.5" />
                    <span>2. Анонимность и Защита Данных:</span>
                  </div>
                  <p className="leading-relaxed">
                    Мы уважительно относимся к вашей приватности. Сервис не требует передачи паспортных данных или личных соцсетей.
                  </p>
                  <ul className="space-y-1.5 pl-2 text-zinc-300">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>Мы <strong className="text-white">никогда не передаем персональные данные третьим лицам</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>Все видеопотоки защищены и не сохраняются на наших серверах.</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-2 pt-1 border-t border-zinc-800/60">
                  <div className="font-bold text-white text-xs flex items-center gap-1.5 text-red-400">
                    <UserX className="w-3.5 h-3.5" />
                    <span>3. Нарушения и Блокировка:</span>
                  </div>
                  <p className="leading-relaxed text-zinc-400">
                    При получении жалоб на мат, неподобающее поведение или вредительство, система автоматически выдает персональную блокировку устройства/IP без возможности восстановления доступа.
                  </p>
                </div>

                <div className="space-y-1 pt-1 border-t border-zinc-800/60">
                  <div className="font-bold text-white text-xs flex items-center gap-1.5 text-zinc-300">
                    <ShieldAlert className="w-3.5 h-3.5 text-orange-400" />
                    <span>4. Возрастные ограничения:</span>
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Использование NorChat разрешено строго лицам, достигшим 16 лет. Нажимая кнопку продолжения, вы подтверждаете соблюдение всех условий.
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-zinc-800/80 space-y-4">
                <RadixCheckboxDemo
                  checked={isAccepted}
                  onCheckedChange={setIsAccepted}
                  label="Я полностью принимаю условия, правила поведения и политику"
                />

                <button
                  onClick={handleCheckoutToHome}
                  disabled={!isAccepted}
                  className={`w-full py-3.5 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 ${
                    isAccepted
                      ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-[0_4px_22px_rgba(249,115,22,0.4)] cursor-pointer active:scale-[0.99]'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-60'
                  }`}
                >
                  <span>Подтвердить и войти</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Welcome;