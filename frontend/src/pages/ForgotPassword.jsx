import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, KeyRound, Sparkles, AlertCircle, Loader2, ArrowLeft, ChevronRight } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { StarsBackground } from '../components/Background/StarsBackgroundDemo';
import MiniMusicPlayer from '../components/Background/MiniMusicPlayer';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { forgotPassword, resetPassword } = useAuthStore();

  const [step, setStep] = useState('email');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Введите корректный email');
      return;
    }

    setLoading(true);

    try {
      const result = await forgotPassword(trimmedEmail);
      setLoading(false);

      if (result && result.success) {
        setSuccess('✅ Код отправлен на ваш email!');
        setStep('reset');
      } else {
        setError(result?.message || 'Ошибка отправки кода');
      }
    } catch (err) {
      setLoading(false);
      setError('Не удалось отправить запрос');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (code.length !== 6) {
      setError('Введите 6-значный код');
      return;
    }

    if (newPassword.length < 6) {
      setError('Новый пароль минимум 6 символов');
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword({
        email: email.trim().toLowerCase(),
        code: code.trim(),
        newPassword: newPassword.trim(),
      });
      setLoading(false);

      if (result && result.success) {
        setSuccess('✅ Пароль изменён! Перенаправляем...');
        setTimeout(() => navigate('/login', { replace: true }), 2000);
      } else {
        setError(result?.message || 'Неверный код');
      }
    } catch (err) {
      setLoading(false);
      setError('Ошибка при сбросе пароля');
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

            {step === 'email' && (
              <form onSubmit={handleSendCode} className="space-y-3.5">
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

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-[0_4px_22px_rgba(249,115,22,0.4)] disabled:opacity-50 cursor-pointer active:scale-[0.99]"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Отправка...
                      </span>
                    ) : (
                      'Получить код'
                    )}
                  </button>
                </div>

                <div className="text-center pt-1">
                  <Link to="/login" className="text-zinc-400 hover:text-white text-xs transition-colors inline-flex items-center gap-1 group">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Вспомнил пароль
                  </Link>
                </div>
              </form>
            )}

            {step === 'reset' && (
              <form onSubmit={handleResetPassword} className="space-y-3.5">
                <div className="text-center mb-1">
                  <p className="text-xs text-zinc-400">
                    Код отправлен на <br/>
                    <span className="text-white font-semibold">{email}</span>
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1 pl-0.5">Код</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="000000"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full pl-10 pr-3.5 py-4 bg-[#141418] border border-zinc-800 rounded-xl text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-orange-500/80 focus:ring-1 focus:ring-orange-500/30 transition-all text-center text-2xl tracking-[10px] font-mono"
                      required
                      maxLength={6}
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1 pl-0.5">Новый пароль</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="password"
                      placeholder="минимум 6 символов"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-4 bg-[#141418] border border-zinc-800 rounded-xl text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-orange-500/80 focus:ring-1 focus:ring-orange-500/30 transition-all"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-[0_4px_22px_rgba(249,115,22,0.4)] disabled:opacity-50 cursor-pointer active:scale-[0.99]"
                  >
                    {loading ? 'Сохранение...' : 'Сменить пароль'}
                  </button>
                </div>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="text-zinc-500 hover:text-white text-[10px] transition-colors underline bg-transparent border-none cursor-pointer"
                  >
                    Изменить email
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

export default ForgotPassword;