import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  AtSign, 
  Calendar, 
  Sparkles, 
  AlertCircle, 
  Loader2, 
  ChevronRight,
  ShieldCheck,
  Eye,
  EyeOff,
  X,
  Check
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { StarsBackground } from '../components/Background/StarsBackgroundDemo';
import MiniMusicPlayer from '../components/Background/MiniMusicPlayer';

// --- КОНСТАНТЫ ДЛЯ 3D WHEEL PICKER ---
const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const ITEM_HEIGHT = 44; // Высота каждого элемента барабана в px

// --- КОМПОНЕНТ ОДНОГО 3D БАРАБАНА (WHEEL COLUMN) ---
const WheelColumn = ({ items, selectedIndex, onChange }) => {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Скролл к выбранному элементу при клике или изменении
  const handleScroll = (e) => {
    if (isDragging) return;
    const scrollTop = e.target.scrollTop;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    if (index !== selectedIndex && index >= 0 && index < items.length) {
      onChange(index);
    }
  };

  const handleItemClick = (index) => {
    onChange(index);
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: index * ITEM_HEIGHT,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = selectedIndex * ITEM_HEIGHT;
    }
  }, [selectedIndex]);

  return (
    <div className="relative h-[220px] flex-1 overflow-hidden select-none">
      {/* Центрирующая оранжевая рамка фокуса */}
      <div 
        className="absolute left-1 right-1 top-[88px] h-[44px] border-y border-orange-500/40 bg-orange-500/10 rounded-lg pointer-events-none z-10 shadow-[0_0_15px_rgba(249,115,22,0.15)]" 
      />

      {/* Скроллируемый контейнер */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
        className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-none py-[88px]"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item, idx) => {
          const isSelected = idx === selectedIndex;
          const distance = Math.abs(idx - selectedIndex);
          // Эффект 3D закругления
          const rotateX = (idx - selectedIndex) * -18;
          const opacity = Math.max(0.2, 1 - distance * 0.3);
          const scale = Math.max(0.85, 1 - distance * 0.08);

          return (
            <div
              key={idx}
              onClick={() => handleItemClick(idx)}
              className="h-[44px] flex items-center justify-center snap-center cursor-pointer transition-all duration-150"
              style={{
                transform: `perspective(400px) rotateX(${rotateX}deg) scale(${scale})`,
                opacity: opacity,
              }}
            >
              <span
                className={`text-sm font-semibold transition-colors ${
                  isSelected
                    ? 'text-orange-400 font-bold text-base drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]'
                    : 'text-zinc-400'
                }`}
              >
                {item}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- МОДАЛЬНОЕ ОКНО 3D-БАРАБАНА ВЫБОРА ДАТЫ ---
const WheelDatePickerModal = ({ isOpen, onClose, initialDate, onConfirm }) => {
  const currentYear = new Date().getFullYear();
  const maxBirthYear = currentYear - 16; // Минимум 16 лет
  const minBirthYear = currentYear - 100;

  const years = Array.from({ length: maxBirthYear - minBirthYear + 1 }, (_, i) => maxBirthYear - i);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  // Инициализация выбранных значений
  const initDate = initialDate ? new Date(initialDate) : new Date(2005, 0, 15);
  
  const [dayIdx, setDayIdx] = useState(
    isNaN(initDate.getDate()) ? 14 : initDate.getDate() - 1
  );
  const [monthIdx, setMonthIdx] = useState(
    isNaN(initDate.getMonth()) ? 0 : initDate.getMonth()
  );
  const [yearIdx, setYearIdx] = useState(() => {
    const y = isNaN(initDate.getFullYear()) ? 2005 : initDate.getFullYear();
    const found = years.indexOf(y);
    return found !== -1 ? found : 0;
  });

  const handleSave = () => {
    const selectedDay = days[dayIdx];
    const selectedMonth = monthIdx + 1;
    const selectedYear = years[yearIdx];

    const formattedMonth = String(selectedMonth).padStart(2, '0');
    const formattedDay = String(selectedDay).padStart(2, '0');

    const formattedDate = `${selectedYear}-${formattedMonth}-${formattedDay}`;
    onConfirm(formattedDate);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-[360px] bg-[#0d0d12] border border-zinc-800 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden"
        >
          {/* Верхний светящийся бордер */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-80" />

          <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800/80">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-500" />
              Дата рождения
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800/50 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Барабан с верхом и низом в градиенте (3D effect overlay) */}
          <div className="relative flex items-center justify-center bg-[#07070a] rounded-2xl border border-zinc-800/60 p-2 overflow-hidden">
            {/* Верхнее и нижнее затемнение для 3D сферы */}
            <div className="absolute top-0 left-0 right-0 h-[70px] bg-gradient-to-b from-[#07070a] via-[#07070a]/70 to-transparent z-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-[70px] bg-gradient-to-t from-[#07070a] via-[#07070a]/70 to-transparent z-20 pointer-events-none" />

            <WheelColumn items={days} selectedIndex={dayIdx} onChange={setDayIdx} />
            <WheelColumn items={MONTHS} selectedIndex={monthIdx} onChange={setMonthIdx} />
            <WheelColumn items={years} selectedIndex={yearIdx} onChange={setYearIdx} />
          </div>

          {/* Подтверждение */}
          <div className="flex gap-2.5 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs rounded-xl transition-all"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl transition-all shadow-[0_4px_15px_rgba(249,115,22,0.35)] flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Готово
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// --- ОСНОВНОЙ КОМПОНЕНТ РЕГИСТРАЦИИ ---
const Register = () => {
  const navigate = useNavigate();
  const { register, verifyCode } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('register');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [birthDate, setBirthDate] = useState('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [gender, setGender] = useState('male');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Форматирование даты для отображения на кнопке
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return 'ДД.ММ.ГГГГ';
    const [y, m, d] = dateStr.split('-');
    const monthName = MONTHS[parseInt(m, 10) - 1];
    return `${parseInt(d, 10)} ${monthName} ${y}`;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedUsername = username.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedUsername || !trimmedPassword || !birthDate) {
      setError('Заполните все поля');
      return;
    }

    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setError('Введите корректный email');
      return;
    }

    if (trimmedUsername.length < 3) {
      setError('Username минимум 3 символа');
      return;
    }

    if (trimmedPassword.length < 6) {
      setError('Пароль минимум 6 символов');
      return;
    }

    const birth = new Date(birthDate);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      calculatedAge--;
    }

    if (isNaN(calculatedAge) || calculatedAge < 16 || calculatedAge > 120) {
      setError('Вам должно быть от 16 до 120 лет');
      return;
    }

    const registerData = {
      email: trimmedEmail,
      username: trimmedUsername,
      password: trimmedPassword,
      gender,
      nickname: trimmedUsername,
      birthDate: birthDate,
      region: 'International',
    };

    setLoading(true);

    try {
      const result = await register(registerData);
      setLoading(false);

      if (result && result.success) {
        setSuccess('✅ Код отправлен на ваш email!');
        setStep('verify');
      } else {
        setError(result?.message || 'Ошибка регистрации');
      }
    } catch {
      setLoading(false);
      setError('Произошла ошибка при регистрации');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (code.length !== 6) {
      setError('Введите 6-значный код');
      return;
    }

    setLoading(true);

    try {
      const result = await verifyCode(email, code);
      setLoading(false);

      if (result && result.success) {
        setSuccess('✅ Аккаунт подтвержден! Перенаправление...');
        setTimeout(() => navigate('/welcome', { replace: true }), 1000);
      } else {
        setError(result?.message || 'Неверный код подтверждения');
      }
    } catch {
      setLoading(false);
      setError('Ошибка при проверке кода');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060608] text-white flex items-center justify-center p-4">
      <StarsBackground 
        starColor="#FFFFFF"
        factor={0.08}
        speed={0.8}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      <div className="absolute w-[360px] h-[360px] bg-orange-500/15 rounded-full blur-[130px] pointer-events-none -z-0" />

      <MiniMusicPlayer autoPlay={true} />

      <div className="relative z-10 w-full max-w-[430px]">
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
          <div className="relative bg-[#080400] backdrop-blur-2xl border border-zinc-800/90 rounded-3xl p-7 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-85" />

            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-500 flex items-center justify-center shadow-[0_0_25px_rgba(249,115,22,0.45)]">
                <span className="text-2xl font-black text-white tracking-wider">N</span>
              </div>
            </div>

            <div className="text-center mb-6">
              <h1 className="text-2xl font-black tracking-tight">
                <span className="text-white">Nor</span>
                <span className="text-orange-500 drop-shadow-[0_0_12px_rgba(249,115,22,0.5)]">Chat</span>
              </h1>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-red-300 text-xs font-medium">{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <p className="text-emerald-300 text-xs font-medium">{success}</p>
              </div>
            )}

            {step === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1 pl-0.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="w-full pl-10 pr-3.5 py-3.5 bg-[#141418] border border-zinc-800 rounded-xl text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-orange-500/80 focus:ring-1 focus:ring-orange-500/30 disabled:opacity-50 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1 pl-0.5">Username</label>
                  <div className="relative">
                    <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="alex_nor"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''))}
                      disabled={loading}
                      className="w-full pl-10 pr-3.5 py-3.5 bg-[#141418] border border-zinc-800 rounded-xl text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-orange-500/80 focus:ring-1 focus:ring-orange-500/30 disabled:opacity-50 transition-all"
                      required
                      minLength={3}
                      maxLength={16}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1 pl-0.5">Пароль</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="w-full pl-10 pr-10 py-3.5 bg-[#141418] border border-zinc-800 rounded-xl text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-orange-500/80 focus:ring-1 focus:ring-orange-500/30 disabled:opacity-50 transition-all"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1 pl-0.5">Дата рождения</label>
                    <button
                      type="button"
                      onClick={() => setIsDatePickerOpen(true)}
                      disabled={loading}
                      className="w-full pl-3.5 pr-2 py-3.5 bg-[#141418] border border-zinc-800 rounded-xl text-left text-xs text-white hover:border-zinc-700 focus:outline-none transition-all flex items-center justify-between"
                    >
                      <span className={birthDate ? 'text-white font-medium' : 'text-zinc-500'}>
                        {formatDisplayDate(birthDate)}
                      </span>
                      <Calendar className="w-4 h-4 text-zinc-500 flex-shrink-0 mr-1" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1 pl-0.5">Пол</label>
                    <div className="relative flex bg-[#141418] border border-zinc-800 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setGender('male')}
                        disabled={loading}
                        className={`relative flex-1 py-2.5 text-xs font-bold rounded-lg transition-colors cursor-pointer z-10 ${
                          gender === 'male' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {gender === 'male' && (
                          <motion.div
                            layoutId="activeGenderTab"
                            className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg -z-10 shadow-[0_0_12px_rgba(249,115,22,0.35)]"
                            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                          />
                        )}
                        👨 Муж
                      </button>
                      <button
                        type="button"
                        onClick={() => setGender('female')}
                        disabled={loading}
                        className={`relative flex-1 py-2.5 text-xs font-bold rounded-lg transition-colors cursor-pointer z-10 ${
                          gender === 'female' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {gender === 'female' && (
                          <motion.div
                            layoutId="activeGenderTab"
                            className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg -z-10 shadow-[0_0_12px_rgba(249,115,22,0.35)]"
                            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                          />
                        )}
                        👩 Жен
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-[0_4px_22px_rgba(249,115,22,0.4)] disabled:opacity-50 cursor-pointer active:scale-[0.99]"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Загрузка...
                      </span>
                    ) : (
                      'Зарегистрироваться'
                    )}
                  </button>
                </div>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="text-zinc-400 hover:text-white text-xs transition-colors inline-flex items-center gap-1 group cursor-pointer"
                  >
                    Уже есть аккаунт? <span className="text-orange-500 font-bold group-hover:underline">Войти</span>
                    <ChevronRight className="w-3.5 h-3.5 text-orange-500 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </form>
            )}

            {step === 'verify' && (
              <form onSubmit={handleVerify} className="space-y-3.5">
                <div className="text-center mb-2">
                  <div className="inline-flex p-2.5 bg-orange-500/10 border border-orange-500/20 rounded-xl mb-2 text-orange-400">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-zinc-400">
                    Код отправлен на <br/>
                    <span className="text-white font-semibold">{email}</span>
                  </p>
                </div>

                <input
                  type="text"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  disabled={loading}
                  className="w-full py-3.5 bg-[#141418] border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 text-center text-2xl tracking-[10px] font-mono font-bold disabled:opacity-50"
                  required
                  maxLength={6}
                  autoFocus
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-[0_4px_22px_rgba(249,115,22,0.4)] disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Проверка...' : 'Подтвердить код'}
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('register');
                      setError('');
                      setSuccess('');
                    }}
                    className="text-xs text-zinc-500 hover:text-white transition-colors underline bg-transparent border-none cursor-pointer"
                  >
                    Назад к регистрации
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>

      {/* Модальное окно 3D Wheel Picker */}
      <WheelDatePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        initialDate={birthDate}
        onConfirm={(date) => setBirthDate(date)}
      />
    </div>
  );
};

export default Register;