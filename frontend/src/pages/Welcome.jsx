import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cake, User, Sparkles, AlertCircle, Loader2, ChevronDown } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import FireworksBackground from '../components/Welcome/FireworksBackground';

const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

const Welcome = () => {
  const navigate = useNavigate();
  const { user, updateUser, isAuthenticated } = useAuthStore();

  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [age, setAge] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  const currentYear = new Date().getFullYear();

  const years = useMemo(() => {
    const list = [];
    for (let y = currentYear - 16; y >= currentYear - 100; y--) list.push(y);
    return list;
  }, [currentYear]);

  const daysInMonth = useMemo(() => {
    if (month === '' || year === '') return 31;
    return new Date(Number(year), Number(month) + 1, 0).getDate();
  }, [month, year]);

  const days = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);

  useEffect(() => {
    if (day !== '' && Number(day) > daysInMonth) setDay(String(daysInMonth));
  }, [daysInMonth, day]);

  useEffect(() => {
    if (day !== '' && month !== '' && year !== '') {
      const today = new Date();
      const birth = new Date(Number(year), Number(month), Number(day));
      let calculatedAge = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) calculatedAge--;
      setAge(calculatedAge);
    } else {
      setAge(null);
    }
  }, [day, month, year]);

  const buildBirthDateISO = () => {
    const mm = String(Number(month) + 1).padStart(2, '0');
    const dd = String(Number(day)).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (day === '' || month === '' || year === '') {
      setError('Укажите полную дату рождения');
      return;
    }
    if (age < 16) {
      setError('Вам должно быть 16 лет или больше');
      return;
    }
    if (!nickname || nickname.length < 2 || nickname.length > 16) {
      setError('Никнейм от 2 до 16 символов');
      return;
    }

    setIsLoading(true);
    try {
      const result = await updateUser({ nickname, birthDate: buildBirthDateISO() });
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message || 'Ошибка обновления профиля');
      }
    } catch {
      setError('Произошла ошибка. Попробуйте снова.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060608] text-white flex items-center justify-center p-4">
      <FireworksBackground className="absolute inset-0 w-full h-full" population={150} color="#FF6B00" />

      <div className="absolute w-[500px] h-[500px] bg-orange-500/15 rounded-full blur-[150px] pointer-events-none -z-0" />

      <div className="relative z-10 w-full max-w-[430px]">
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
          <div className="relative bg-[#080400] backdrop-blur-2xl border border-zinc-800/90 rounded-3xl p-7 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-85" />

            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-500 flex items-center justify-center shadow-[0_0_25px_rgba(249,115,22,0.45)]">
                <span className="text-2xl font-black text-white tracking-wider">N</span>
              </div>
            </div>

            <div className="text-center mb-5">
              <h1 className="text-xl font-black tracking-tight">
                <span className="text-white">Nor</span>
                <span className="text-orange-500 drop-shadow-[0_0_12px_rgba(249,115,22,0.5)]">Chat</span>
              </h1>
              <p className="text-zinc-400 text-xs mt-1">Заполните профиль</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-red-300 text-xs font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1 pl-0.5">Дата рождения</label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="relative">
                    <select
                      value={day}
                      onChange={(e) => setDay(e.target.value)}
                      className="w-full py-4 px-3 bg-[#141418] border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500/80 focus:ring-1 focus:ring-orange-500/30 appearance-none cursor-pointer"
                    >
                      <option value="">День</option>
                      {days.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  </div>
                  <div className="relative">
                    <select
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      className="w-full py-4 px-3 bg-[#141418] border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500/80 focus:ring-1 focus:ring-orange-500/30 appearance-none cursor-pointer"
                    >
                      <option value="">Месяц</option>
                      {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  </div>
                  <div className="relative">
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full py-4 px-3 bg-[#141418] border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500/80 focus:ring-1 focus:ring-orange-500/30 appearance-none cursor-pointer"
                    >
                      <option value="">Год</option>
                      {years.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  </div>
                </div>
                {age !== null ? (
                  <p className={`text-[10px] mt-1.5 pl-0.5 ${age >= 16 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {age >= 16 ? `✅ ${age} лет` : `❌ ${age} лет — нужно 16+`}
                  </p>
                ) : (
                  <p className="text-[10px] text-zinc-500 mt-1.5 pl-0.5">Укажите дату рождения</p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1 pl-0.5">Никнейм</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Ваш никнейм"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value.slice(0, 16))}
                    className="w-full pl-10 pr-14 py-4 bg-[#141418] border border-zinc-800 rounded-xl text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-orange-500/80 focus:ring-1 focus:ring-orange-500/30 transition-all"
                    minLength={2}
                    maxLength={16}
                  />
                  <span className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono ${nickname.length >= 2 && nickname.length <= 16 ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    {nickname.length}/16
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-[0_4px_22px_rgba(249,115,22,0.4)] disabled:opacity-50 cursor-pointer active:scale-[0.99]"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Сохранение...
                    </span>
                  ) : (
                    'Продолжить'
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Welcome;