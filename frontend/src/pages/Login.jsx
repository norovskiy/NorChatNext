import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import { Mail, Lock, AtSign, Sparkles, AlertCircle, Loader2, ChevronRight } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { StarsBackground } from '../components/Background/StarsBackground';
import MiniMusicPlayer from '../components/Background/MiniMusicPlayer';

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login, register, googleAuth, isLoading, user } = useAuthStore();

  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.nickname && user?.birthDate) {
        navigate('/');
      } else {
        navigate('/welcome');
      }
    }
  }, [isAuthenticated, navigate, user]);

  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      setError('');
      const result = await googleAuth(response.access_token);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message);
      }
    },
    onError: () => setError('Google auth failed'),
    flow: 'implicit',
    scope: 'openid email profile'
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login({ email, password });
    if (result.success) {
      const userData = result.data?.user;
      if (userData?.nickname && userData?.birthDate) {
        navigate('/');
      } else {
        navigate('/welcome');
      }
    } else {
      setError(result.message);
    }
  };

  const handleUsernameChange = (e) => {
    const cleaned = e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, '');
    setUsername(cleaned);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }

    if (username.length < 3) {
      setError('Имя пользователя должно быть не менее 3 символов');
      return;
    }

    const registerData = {
      username,
      email,
      password,
      gender,
      nickname: username,
      birthDate: new Date('2000-01-01').toISOString().split('T')[0],
      region: 'International'
    };

    const result = await register(registerData);
    if (result.success) {
      setSuccess('Регистрация успешна!');
      setTimeout(() => {
        navigate('/welcome');
      }, 1500);
    } else {
      setError(result.message);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* ========== ФОН СО ЗВЕЗДАМИ ========== */}
      <StarsBackground 
        starColor="#FFFFFF"
        factor={0.08}
        speed={0.8}
        className="absolute inset-0 w-full h-full"
      />

      {/* ========== МИНИ-ПЛЕЕР ========== */}
      <MiniMusicPlayer autoPlay={true} />

      {/* ========== ОСНОВНОЙ КОНТЕНТ ========== */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="w-full max-w-[400px]"
        >
          <motion.div variants={itemVariants} className="relative group">
            <div className="relative bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/50 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-orange-500/30 to-transparent opacity-60" />

              {/* ========== ЛОГОТИП ========== */}
              <motion.div variants={logoVariants} className="flex justify-center mb-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <span className="text-2xl font-black text-white">N</span>
                  </div>
                  <div className="absolute inset-0 rounded-xl blur-xl bg-orange-500/20 -z-10" />
                </div>
              </motion.div>

              {/* ========== ЗАГОЛОВОК ========== */}
              <motion.div variants={itemVariants} className="text-center mb-5">
                <h1 className="text-2xl font-bold">
                  <span className="text-white">Nor</span>
                  <span className="text-orange-500">Chat</span>
                </h1>
                <p className="text-zinc-400 text-sm mt-1">
                  {mode === 'login' && 'Войдите в свой аккаунт'}
                  {mode === 'register' && 'Создайте новый аккаунт'}
                </p>
              </motion.div>

              {/* ========== ОШИБКИ/УСПЕХ ========== */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-200 text-xs">{error}</p>
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-2"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-emerald-200 text-xs">{success}</p>
                </motion.div>
              )}

              {/* ========== ЛОГИН ========== */}
              {mode === 'login' && (
                <form onSubmit={handleLogin} className="space-y-3">
                  <motion.div variants={itemVariants}>
                    <div className="relative group/input">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within/input:text-orange-400 transition-colors" />
                      <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 hover:bg-white/10"
                        required
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <div className="relative group/input">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within/input:text-orange-400 transition-colors" />
                      <input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 hover:bg-white/10"
                        required
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="relative w-full py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium text-sm rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden group/btn"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                      <span className="relative flex items-center justify-center gap-2">
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Загрузка...
                          </>
                        ) : (
                          'Войти'
                        )}
                      </span>
                    </button>
                  </motion.div>

                  <motion.div variants={itemVariants} className="relative my-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-3 bg-black text-zinc-500 text-xs">или</span>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <button
                      type="button"
                      onClick={() => googleLogin()}
                      className="w-full py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group text-sm"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.4 1.7 14.9 1 12 1 7.7 1 4 3.5 2.2 7.1l3.7 2.8C6.8 7.3 9.2 5 12 5z"/>
                        <path fill="#4285F4" d="M22.6 12.3c0-.8-.1-1.5-.2-2.3H12v4.3h5.9c-.3 1.4-1.1 2.6-2.2 3.3l3.6 2.8c2.1-1.9 3.3-4.7 3.3-8.1z"/>
                        <path fill="#FBBC05" d="M5.9 14.1c-.2-.7-.4-1.4-.4-2.1s.2-1.4.4-2.1L2.2 7.1C1.4 8.6 1 10.2 1 12s.4 3.4 1.2 4.9l3.7-2.8z"/>
                        <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.8c-1 .7-2.2 1.1-3.7 1.1-2.8 0-5.2-1.9-6.1-4.5L2.2 17C4 20.5 7.7 23 12 23z"/>
                      </svg>
                      <span>Google</span>
                    </button>
                  </motion.div>

                  <motion.div variants={itemVariants} className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setMode('register')}
                      className="text-zinc-400 hover:text-white text-xs transition-colors flex items-center justify-center gap-1 group"
                    >
                      Нет аккаунта? <span className="text-orange-500 group-hover:underline">Зарегистрироваться</span>
                      <ChevronRight className="w-3 h-3 text-orange-500 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </motion.div>
                </form>
              )}

              {/* ========== РЕГИСТРАЦИЯ ========== */}
              {mode === 'register' && (
                <form onSubmit={handleRegister} className="space-y-3">
                  <motion.div variants={itemVariants}>
                    <div className="relative group/input">
                      <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within/input:text-orange-400 transition-colors" />
                      <input
                        type="text"
                        placeholder="username"
                        value={username}
                        onChange={handleUsernameChange}
                        className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 hover:bg-white/10"
                        required
                        minLength={3}
                        maxLength={20}
                        autoCapitalize="none"
                        autoCorrect="off"
                      />
                    </div>
                    <p className="text-[10px] text-zinc-500 pl-1 mt-1">
                      Только латиница, цифры, точка и _
                    </p>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <div className="relative group/input">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within/input:text-orange-400 transition-colors" />
                      <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 hover:bg-white/10"
                        required
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <div className="relative group/input">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within/input:text-orange-400 transition-colors" />
                      <input
                        type="password"
                        placeholder="Пароль (мин. 6 символов)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 hover:bg-white/10"
                        required
                        minLength={6}
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <p className="text-xs text-zinc-400 mb-1">Пол</p>
                    <div className="flex gap-2">
                      {['male', 'female'].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGender(g)}
                          className={`flex-1 py-2 rounded-xl transition-all duration-300 text-sm ${
                            gender === g
                              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25'
                              : 'bg-white/5 border border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {g === 'male' && '👨 Мужской'}
                          {g === 'female' && '👩 Женский'}
                        </button>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="relative w-full py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium text-sm rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden group/btn"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                      <span className="relative flex items-center justify-center gap-2">
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Загрузка...
                          </>
                        ) : (
                          'Создать аккаунт'
                        )}
                      </span>
                    </button>
                  </motion.div>

                  <motion.div variants={itemVariants} className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-zinc-400 hover:text-white text-xs transition-colors flex items-center justify-center gap-1 group"
                    >
                      Уже есть аккаунт? <span className="text-orange-500 group-hover:underline">Войти</span>
                      <ChevronRight className="w-3 h-3 text-orange-500 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </motion.div>
                </form>
              )}

              {/* ========== ПОДВАЛ ========== */}
              <motion.div
                variants={itemVariants}
                className="mt-4 pt-4 border-t border-white/5 text-center"
              >
                <p className="text-zinc-600 text-[10px] flex items-center justify-center gap-2">
                  <span className="text-orange-500">●</span>
                  {mode === 'login' ? 'Войдите в NorChat' : 'Присоединяйтесь к NorChat'}
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

export default Login;