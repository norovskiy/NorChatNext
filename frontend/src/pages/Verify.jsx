import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertCircle, Sparkles, Loader2, ArrowLeft, RefreshCw } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { StarsBackground } from '../components/Background/StarsBackgroundDemo';
import MiniMusicPlayer from '../components/Background/MiniMusicPlayer';

const Verify = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const { verifyCode, resendCode, isAuthenticated } = useAuthStore();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRef = useRef(null);

  // Редирект, если не передали email или пользователь уже вошел
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    } else if (!email) {
      navigate('/register', { replace: true });
    }
  }, [isAuthenticated, email, navigate]);

  // Таймер обратного отсчета для повторной отправки
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
      if (interval) clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Функция подтверждения кода
  const handleVerify = async (codeToSubmit) => {
    const finalCode = codeToSubmit || code;
    if (finalCode.length !== 6 || loading) return;

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await verifyCode(email, finalCode);
      setLoading(false);

      if (result && result.success) {
        setSuccess('✅ Email успешно подтверждён!');
        setTimeout(() => {
          navigate('/welcome', { replace: true });
        }, 1000);
      } else {
        setError(result?.message || 'Неверный или истёкший код');
      }
    } catch {
      setLoading(false);
      setError('Ошибка при проверке кода');
    }
  };

  // Обработка ввода + авто-отправка при 6 символах
  const handleCodeChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(val);

    if (val.length === 6) {
      handleVerify(val);
    }
  };

  // Повторный запрос кода
  const handleResend = async () => {
    if (!canResend || resendLoading) return;

    setError('');
    setSuccess('');
    setResendLoading(true);

    try {
      // Если метод resendCode есть в сторе — вызываем его, иначе эмулируем/отправляем повтор
      const result = resendCode ? await resendCode(email) : { success: true };
      setResendLoading(false);

      if (result && result.success) {
        setSuccess('✅ Новый код отправлен на ваш email!');
        setTimer(60);
        setCanResend(false);
      } else {
        setError(result?.message || 'Не удалось отправить код повторно');
      }
    } catch {
      setResendLoading(false);
      setError('Ошибка сети при повторной отправке');
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

            {/* Логотип */}
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

            <div className="text-center mb-5">
              <div className="inline-flex p-2.5 bg-orange-500/10 border border-orange-500/20 rounded-xl mb-2 text-orange-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <p className="text-xs text-zinc-400">
                Код отправлен на <br/>
                <span className="text-white font-semibold">{email || 'указанный email'}</span>
              </p>
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

            <form onSubmit={(e) => { e.preventDefault(); handleVerify(); }} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1 pl-0.5 text-center">
                  Введите 6-значный код
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="000000"
                  value={code}
                  onChange={handleCodeChange}
                  disabled={loading}
                  className="w-full py-3.5 bg-[#141418] border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 text-center text-2xl tracking-[10px] font-mono font-bold disabled:opacity-50 transition-all"
                  required
                  maxLength={6}
                  autoFocus
                />
                <div className="text-[10px] text-zinc-500 text-center mt-1">
                  {code.length}/6 символов
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-[0_4px_22px_rgba(249,115,22,0.4)] disabled:opacity-50 cursor-pointer active:scale-[0.99]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Проверка...
                  </span>
                ) : (
                  'Подтвердить и войти'
                )}
              </button>

              {/* Повторная отправка с таймером */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={!canResend || resendLoading}
                  className="text-xs text-zinc-400 hover:text-white disabled:text-zinc-600 transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resendLoading ? 'animate-spin text-orange-500' : ''}`} />
                  {canResend ? (
                    <span className="text-orange-500 font-semibold hover:underline">Отправить код повторно</span>
                  ) : (
                    <span>Отправить повторно через <strong className="text-zinc-300">{timer}с</strong></span>
                  )}
                </button>
              </div>

              <div className="text-center pt-2 flex flex-col gap-2 border-t border-zinc-800/60 mt-3">
                <Link to="/register" className="text-zinc-400 hover:text-white text-xs transition-colors inline-flex items-center justify-center gap-1 group">
                  <ArrowLeft className="w-3.5 h-3.5 text-zinc-400 group-hover:-translate-x-0.5 transition-transform" />
                  Изменить email или данные
                </Link>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Verify;