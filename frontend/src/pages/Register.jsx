import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const Register = () => {
  const navigate = useNavigate();
  const { register, verifyCode } = useAuthStore();

  // Локальный loading, чтобы не размонтировать компонент при запросе
  const [loading, setLoading] = useState(false);

  const [step, setStep] = useState('register');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ========== ШАГ 1 ==========
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedUsername = username.trim().toLowerCase();
    const trimmedPassword = password.trim();
    const parsedAge = parseInt(age);

    if (!trimmedEmail || !trimmedUsername || !trimmedPassword || !age) {
      setError('Все поля обязательны');
      return;
    }

    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setError('Введите корректный email');
      return;
    }

    if (trimmedUsername.length < 3) {
      setError('Username должен быть минимум 3 символа');
      return;
    }

    if (trimmedPassword.length < 6) {
      setError('Пароль должен быть минимум 6 символов');
      return;
    }

    if (isNaN(parsedAge) || parsedAge < 16 || parsedAge > 120) {
      setError('Вам должно быть 16 лет или больше');
      return;
    }

    const birthDate = new Date();
    birthDate.setFullYear(birthDate.getFullYear() - parsedAge);

    const registerData = {
      email: trimmedEmail,
      username: trimmedUsername,
      password: trimmedPassword,
      gender,
      nickname: trimmedUsername,
      birthDate: birthDate.toISOString().split('T')[0],
      region: 'International',
    };

    setLoading(true);

    try {
      const result = await register(registerData);
      setLoading(false);

      if (result && result.success) {
        setSuccess('✅ Код подтверждения отправлен на ваш email!');
        setStep('verify'); // ТЕПЕРЬ СТЕЙТ НЕ СБРОСИТСЯ!
      } else {
        setError(result?.message || 'Ошибка регистрации');
      }
    } catch (err) {
      setLoading(false);
      setError('Произошла ошибка при регистрации');
    }
  };

  // ========== ШАГ 2 ==========
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
        setSuccess('✅ Аккаунт успешно подтвержден!');
        setTimeout(() => navigate('/', { replace: true }), 1500);
      } else {
        setError(result?.message || 'Неверный код подтверждения');
      }
    } catch (err) {
      setLoading(false);
      setError('Ошибка при проверке кода');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0A0A0C] text-white flex items-center justify-center p-4 overflow-hidden">
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
            {step === 'register' ? 'Создайте новый аккаунт' : 'Подтверждение почты'}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-[#FF3B30]/10 border border-[#FF3B30]/30 rounded-xl text-[#FF3B30] text-sm text-center font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 p-3.5 bg-[#00E676]/10 border border-[#00E676]/30 rounded-xl text-[#00E676] text-sm text-center font-medium">
            {success}
          </div>
        )}

        {/* ================= ФОРМА РЕГИСТРАЦИИ ================= */}
        {step === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#8E8E93] mb-2 pl-1">Email</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#1A1A20] border border-[#26262E] rounded-xl text-white placeholder-[#8E8E93]/50 focus:outline-none focus:border-[#FF6B00] transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8E8E93] mb-2 pl-1">Username</label>
              <input
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''))}
                className="w-full px-4 py-3 bg-[#1A1A20] border border-[#26262E] rounded-xl text-white placeholder-[#8E8E93]/50 focus:outline-none focus:border-[#FF6B00] transition-all"
                required
                minLength={3}
                maxLength={16}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8E8E93] mb-2 pl-1">Пароль</label>
              <input
                type="password"
                placeholder="Минимум 6 символов"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#1A1A20] border border-[#26262E] rounded-xl text-white placeholder-[#8E8E93]/50 focus:outline-none focus:border-[#FF6B00] transition-all"
                required
                minLength={6}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#8E8E93] mb-2 pl-1">Возраст</label>
                <input
                  type="number"
                  placeholder="16+"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1A1A20] border border-[#26262E] rounded-xl text-white placeholder-[#8E8E93]/50 focus:outline-none focus:border-[#FF6B00] transition-all"
                  required
                  min={16}
                  max={120}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8E8E93] mb-2 pl-1">Пол</label>
                <div className="flex bg-[#1A1A20] border border-[#26262E] rounded-xl overflow-hidden p-1">
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`flex-1 py-2 text-sm rounded-lg transition-all ${gender === 'male' ? 'bg-[#FF6B00] text-white' : 'text-[#8E8E93] hover:text-white'}`}
                  >
                    Муж
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`flex-1 py-2 text-sm rounded-lg transition-all ${gender === 'female' ? 'bg-[#FF6B00] text-white' : 'text-[#8E8E93] hover:text-white'}`}
                  >
                    Жен
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3.5 bg-[#FF6B00] hover:bg-[#FF7B1A] active:scale-[0.98] text-white font-bold text-sm rounded-xl transition-all shadow-[0_4px_20px_rgba(255,107,0,0.3)] disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Загрузка...' : 'Зарегистрироваться'}
            </button>

            <div className="text-center pt-2">
              <Link to="/login" className="text-xs text-[#8E8E93] hover:text-white transition-colors">
                Уже есть аккаунт? <span className="text-[#FF6B00]">Войти</span>
              </Link>
            </div>
          </form>
        )}

        {/* ================= ФОРМА ВВОДА КОДА ================= */}
        {step === 'verify' && (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-sm text-[#8E8E93]">
                Мы отправили код на <br/> <span className="text-white font-semibold">{email}</span>
              </p>
            </div>

            <div>
              <input
                type="text"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full py-3.5 bg-[#1A1A20] border border-[#26262E] rounded-xl text-white placeholder-[#8E8E93]/30 focus:outline-none focus:border-[#FF6B00] transition-all text-center text-2xl tracking-[12px] font-mono font-bold"
                required
                maxLength={6}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 bg-[#FF6B00] hover:bg-[#FF7B1A] active:scale-[0.98] text-white font-bold text-sm rounded-xl transition-all shadow-[0_4px_20px_rgba(255,107,0,0.3)] disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Проверка...' : 'Подтвердить'}
            </button>
            
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setStep('register')}
                className="text-xs text-[#8E8E93] hover:text-white transition-colors underline bg-transparent border-none cursor-pointer"
              >
                Вернуться назад
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default Register;