import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { forgotPassword, resetPassword } = useAuthStore();

  const [step, setStep] = useState('email'); // 'email' | 'reset'
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ========== ШАГ 1: ОТПРАВКА КОДА НА EMAIL ==========
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
        setSuccess('✅ Код для сброса пароля отправлен на ваш email!');
        setStep('reset'); // Переходим к вводу кода и нового пароля
      } else {
        setError(result?.message || 'Ошибка отправки кода');
      }
    } catch (err) {
      setLoading(false);
      setError('Не удалось отправить запрос');
    }
  };

  // ========== ШАГ 2: ВВОД КОДА И НОВОГО ПАРОЛЯ ==========
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (code.length !== 6) {
      setError('Введите 6-значный код');
      return;
    }

    if (newPassword.length < 6) {
      setError('Новый пароль должен быть минимум 6 символов');
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
        setSuccess('✅ Пароль успешно изменён! Перенаправляем на страницу входа...');
        setTimeout(() => navigate('/login', { replace: true }), 2000);
      } else {
        setError(result?.message || 'Неверный код или ошибка сброса');
      }
    } catch (err) {
      setLoading(false);
      setError('Ошибка при сбросе пароля');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0A0A0C] text-white flex items-center justify-center p-4 overflow-hidden">
      {/* Фоновый оранжевый градиент */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[140px] opacity-20 pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, #FF6B00 0%, transparent 70%)' }}
      />

      <div className="relative z-10 w-full max-w-md bg-[#141418]/80 backdrop-blur-2xl border border-[#26262E] rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Nor<span className="text-[#FF6B00]">Chat</span>
          </h1>
          <p className="text-[#8E8E93] text-sm">
            {step === 'email' ? 'Восстановление доступа' : 'Установка нового пароля'}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-[#FF3B30]/10 border border-[#FF3B30]/30 rounded-xl text-[#FF3B30] text-sm text-center font-medium">
            ❌ {error}
          </div>
        )}

        {success && (
          <div className="mb-5 p-3.5 bg-[#00E676]/10 border border-[#00E676]/30 rounded-xl text-[#00E676] text-sm text-center font-medium">
            {success}
          </div>
        )}

        {/* ================= ШАГ 1: ВВОД EMAIL ================= */}
        {step === 'email' && (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#8E8E93] mb-2 pl-1">Email от аккаунта</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#1A1A20] border border-[#26262E] rounded-xl text-white placeholder-[#8E8E93]/50 focus:outline-none focus:border-[#FF6B00] transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 bg-[#FF6B00] hover:bg-[#FF7B1A] active:scale-[0.98] text-white font-bold text-sm rounded-xl transition-all shadow-[0_4px_20px_rgba(255,107,0,0.3)] disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Отправка...' : 'Получить код'}
            </button>

            <div className="text-center pt-2">
              <Link to="/login" className="text-xs text-[#8E8E93] hover:text-white transition-colors">
                Вспомнили пароль? <span className="text-[#FF6B00]">Войти</span>
              </Link>
            </div>
          </form>
        )}

        {/* ================= ШАГ 2: ВВОД КОДА И НОВОГО ПАРОЛЯ ================= */}
        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="text-center mb-2">
              <p className="text-sm text-[#8E8E93]">
                Код отправлен на <br/> <span className="text-white font-semibold">{email}</span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8E8E93] mb-2 pl-1">6-значный код</label>
              <input
                type="text"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full py-3 bg-[#1A1A20] border border-[#26262E] rounded-xl text-white placeholder-[#8E8E93]/30 focus:outline-none focus:border-[#FF6B00] transition-all text-center text-2xl tracking-[10px] font-mono font-bold"
                required
                maxLength={6}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8E8E93] mb-2 pl-1">Новый пароль</label>
              <input
                type="password"
                placeholder="Минимум 6 символов"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#1A1A20] border border-[#26262E] rounded-xl text-white placeholder-[#8E8E93]/50 focus:outline-none focus:border-[#FF6B00] transition-all"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 bg-[#FF6B00] hover:bg-[#FF7B1A] active:scale-[0.98] text-white font-bold text-sm rounded-xl transition-all shadow-[0_4px_20px_rgba(255,107,0,0.3)] disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Сохранение...' : 'Сменить пароль'}
            </button>
            
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setStep('email')}
                className="text-xs text-[#8E8E93] hover:text-white transition-colors underline bg-transparent border-none cursor-pointer"
              >
                Изменить email
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default ForgotPassword;