import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  AtSign, 
  Calendar, 
  Sparkles, 
  AlertCircle, 
  Loader2, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { StarsBackground } from '../components/Background/StarsBackgroundDemo';
import MiniMusicPlayer from '../components/Background/MiniMusicPlayer';

const Register = () => {
  const navigate = useNavigate();
  const { register, verifyCode } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('register');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('male');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    } catch (err) {
      setLoading(false);
      setError('Произошла ошибка при регистрации');
    }
  };

  // ========== ИСПРАВЛЕННАЯ ФУНКЦИЯ ==========
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
      // ✅ ИСПРАВЛЕНО: verifyCode, а НЕ register!
      const result = await verifyCode(email, code);
      setLoading(false);

      if (result && result.success) {
        setSuccess('✅ Аккаунт подтвержден! Перенаправление...');
        setTimeout(() => navigate('/welcome', { replace: true }), 1000);
      } else {
        setError(result?.message || 'Неверный код подтверждения');
      }
    } catch (err) {
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
        className="absolute inset-0 w-full h-full"
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
                      className="w-full pl-10 pr-3.5 py-4 bg-[#141418] border border-zinc-800 rounded-xl text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-orange-500/80 focus:ring-1 focus:ring-orange-500/30 transition-all"
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
                      className="w-full pl-10 pr-3.5 py-4 bg-[#141418] border border-zinc-800 rounded-xl text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-orange-500/80 focus:ring-1 focus:ring-orange-500/30 transition-all"
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
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-4 bg-[#141418] border border-zinc-800 rounded-xl text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-orange-500/80 focus:ring-1 focus:ring-orange-500/30 transition-all"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1 pl-0.5">Дата рождения</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                      <input
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="w-full pl-9 pr-2 py-4 bg-[#141418] border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500/80 focus:ring-1 focus:ring-orange-500/30 transition-all [color-scheme:dark]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1 pl-0.5">Пол</label>
                    <div className="relative flex bg-[#141418] border border-zinc-800 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setGender('male')}
                        className={`relative flex-1 py-3.5 text-xs font-bold rounded-lg transition-colors cursor-pointer z-10 ${
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
                        className={`relative flex-1 py-3.5 text-xs font-bold rounded-lg transition-colors cursor-pointer z-10 ${
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
                    className="w-full py-4 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-[0_4px_22px_rgba(249,115,22,0.4)] disabled:opacity-50 cursor-pointer active:scale-[0.99]"
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
                  className="w-full py-4 bg-[#141418] border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 text-center text-2xl tracking-[10px] font-mono font-bold"
                  required
                  maxLength={6}
                  autoFocus
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-[0_4px_22px_rgba(249,115,22,0.4)] disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Проверка...' : 'Подтвердить код'}
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setStep('register')}
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
    </div>
  );
};

export default Register;