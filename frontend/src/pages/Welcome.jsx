import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cake, User, Sparkles, AlertCircle, Loader2, ChevronDown } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import FireworksBackground from '../components/Welcome/FireworksBackground';

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const Welcome = () => {
  const navigate = useNavigate();
  const { user, updateUser, isAuthenticated } = useAuthStore();

  const [day, setDay] = useState('');
  const [month, setMonth] = useState(''); // 0-11
  const [year, setYear] = useState('');
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [age, setAge] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const currentYear = new Date().getFullYear();

  // Список лет: от текущего года-16 (минимальный возраст) вниз до текущего года-100,
  // сразу отсортирован так, чтобы недавние совершеннолетние года были ближе к выбору
  const years = useMemo(() => {
    const list = [];
    for (let y = currentYear - 16; y >= currentYear - 100; y--) {
      list.push(y);
    }
    return list;
  }, [currentYear]);

  // Число дней в выбранном месяце/году, чтобы не давать выбрать 31 февраля
  const daysInMonth = useMemo(() => {
    if (month === '' || year === '') return 31;
    return new Date(Number(year), Number(month) + 1, 0).getDate();
  }, [month, year]);

  const days = useMemo(
    () => Array.from({ length: daysInMonth }, (_, i) => i + 1),
    [daysInMonth]
  );

  // Если сменили месяц/год и текущий день стал невалидным (например было 31, а стало 30) — подрезаем
  useEffect(() => {
    if (day !== '' && Number(day) > daysInMonth) {
      setDay(String(daysInMonth));
    }
  }, [daysInMonth, day]);

  // Вычисление возраста при полном выборе даты
  useEffect(() => {
    if (day !== '' && month !== '' && year !== '') {
      const today = new Date();
      const birth = new Date(Number(year), Number(month), Number(day));
      let calculatedAge = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        calculatedAge--;
      }
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
      setError('Пожалуйста, укажите полную дату рождения');
      return;
    }

    if (age < 16) {
      setError('Вам должно быть 16 лет или больше');
      return;
    }

    if (!nickname || nickname.length < 2 || nickname.length > 16) {
      setError('Никнейм должен быть от 2 до 16 символов');
      return;
    }

    setIsLoading(true);

    try {
      const result = await updateUser({
        nickname,
        birthDate: buildBirthDateISO(),
      });

      if (result.success) {
        navigate('/homepage');
      } else {
        setError(result.message || 'Ошибка обновления профиля');
      }
    } catch (err) {
      setError('Произошла ошибка. Попробуйте снова.');
    } finally {
      setIsLoading(false);
    }
  };

  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
  };

  const logoVariants = {
    hidden: { opacity: 0, scale: 0.5, rotate: -10 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        type: 'spring',
        damping: 15,
        stiffness: 120,
        delay: 0.2,
      },
    },
  };

  const selectClass =
    "w-full appearance-none bg-white/5 border-2 border-white/10 rounded-2xl text-white text-sm px-4 py-3.5 pr-9 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all duration-300 hover:bg-white/10 cursor-pointer";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#09090B]">
      {/* ========== ФЕЙЕРВЕРКИ ========== */}
      <FireworksBackground
        className="absolute inset-0 w-full h-full"
        population={150}
        color="#FF6B00"
      />

      {/* ========== ФОНОВЫЕ ГРАДИЕНТЫ ========== */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-30 animate-pulse"
          style={{ background: 'radial-gradient(circle, #FF6B00, transparent)' }}
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-20 animate-pulse"
          style={{
            background: 'radial-gradient(circle, #FF8A00, transparent)',
            animationDelay: '2s'
          }}
        />
        <div
          className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-[150px] opacity-10"
          style={{ background: 'radial-gradient(circle, #FF6B00, transparent)' }}
        />
      </div>

      {/* ========== ОСНОВНОЙ КОНТЕНТ ========== */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="w-full max-w-[480px]"
        >
          {/* ========== КАРТОЧКА ========== */}
          <motion.div
            variants={itemVariants}
            className="relative group"
          >
            {/* Свечение карточки */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-orange-500/20 via-transparent to-orange-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            {/* Основная карточка */}
            <div className="relative bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/50 overflow-hidden">
              {/* Верхняя светящаяся линия */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-60" />

              {/* Блик */}
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

              {/* ========== ЛОГОТИП ========== */}
              <motion.div
                variants={logoVariants}
                className="flex justify-center mb-6"
              >
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-2xl shadow-orange-500/30">
                    <span className="text-4xl font-black text-white">N</span>
                  </div>
                  {/* Свечение логотипа */}
                  <div className="absolute inset-0 rounded-2xl blur-xl bg-orange-500/30 -z-10" />
                </div>
              </motion.div>

              {/* ========== ЗАГОЛОВОК ========== */}
              <motion.div variants={itemVariants} className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                  Добро пожаловать
                </h1>
                <p className="text-2xl sm:text-3xl font-bold">
                  <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                    NorChat
                  </span>
                </p>
                <p className="text-zinc-400 text-sm mt-3">
                  Заполните профиль, чтобы начать общение.
                </p>
              </motion.div>

              {/* ========== ОШИБКА ========== */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-200 text-sm">{error}</p>
                </motion.div>
              )}

              {/* ========== ФОРМА ========== */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* ========== ДАТА РОЖДЕНИЯ ========== */}
                <motion.div variants={itemVariants} className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-300">
                    <Cake className="w-4 h-4 text-orange-400" />
                    Дата рождения
                  </label>

                  <div className="grid grid-cols-3 gap-2">
                    {/* День */}
                    <div className="relative">
                      <select
                        value={day}
                        onChange={(e) => setDay(e.target.value)}
                        className={selectClass}
                      >
                        <option value="" disabled>День</option>
                        {days.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    </div>

                    {/* Месяц */}
                    <div className="relative">
                      <select
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className={selectClass}
                      >
                        <option value="" disabled>Месяц</option>
                        {MONTHS.map((m, i) => (
                          <option key={m} value={i}>{m}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    </div>

                    {/* Год */}
                    <div className="relative">
                      <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className={selectClass}
                      >
                        <option value="" disabled>Год</option>
                        {years.map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between min-h-[18px]">
                    {age !== null ? (
                      <p className={`text-xs flex items-center gap-1 ${age >= 16 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {age < 16 && <AlertCircle className="w-3 h-3" />}
                        Вам {age} {age % 10 === 1 && age % 100 !== 11 ? 'год' : [2,3,4].includes(age % 10) && ![12,13,14].includes(age % 100) ? 'года' : 'лет'}
                      </p>
                    ) : (
                      <p className="text-zinc-500 text-xs">Нужно быть старше 16 лет</p>
                    )}
                  </div>
                </motion.div>

                {/* ========== НИКНЕЙМ ========== */}
                <motion.div variants={itemVariants} className="space-y-1.5">
                  <label className="block text-sm font-medium text-zinc-300">
                    Никнейм
                  </label>
                  <div className="relative group/input">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within/input:text-orange-400 transition-colors" />
                    <input
                      type="text"
                      placeholder="Введите никнейм"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value.slice(0, 16))}
                      minLength={2}
                      maxLength={16}
                      className="w-full pl-12 pr-16 py-3.5 bg-white/5 border-2 border-white/10 rounded-2xl text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all duration-300 hover:bg-white/10"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-zinc-500" />
                      <span className={`text-xs font-mono ${nickname.length >= 2 && nickname.length <= 16 ? 'text-emerald-400' : 'text-zinc-500'}`}>
                        {nickname.length}/16
                      </span>
                    </div>
                  </div>
                  <p className="text-zinc-500 text-xs">
                    От 2 до 16 символов
                  </p>
                </motion.div>

                {/* ========== КНОПКА ========== */}
                <motion.div variants={itemVariants} className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="relative w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold text-base rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden group/btn"
                  >
                    {/* Блик */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />

                    {/* Свечение кнопки */}
                    <div className="absolute inset-0 blur-xl bg-orange-500/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />

                    <span className="relative flex items-center justify-center gap-2">
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Сохранение...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Продолжить в NorChat
                        </>
                      )}
                    </span>
                  </button>
                </motion.div>
              </form>

              {/* ========== ПОДВАЛ ========== */}
              <motion.div
                variants={itemVariants}
                className="mt-8 pt-6 border-t border-white/5 text-center"
              >
                <p className="text-zinc-600 text-xs flex items-center justify-center gap-2">
                  <span className="text-orange-500">●</span>
                  Добро пожаловать в NorChat
                  <span className="text-orange-500">●</span>
                </p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Welcome;