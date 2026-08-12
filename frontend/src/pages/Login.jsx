import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import useAuthStore from '../store/useAuthStore';

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login, googleAuth } = useAuthStore();

  // Локальный loading, чтобы избежать сброса компонента через App.jsx
  const [loading, setLoading] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier || !password) {
      setError('Введите email/username и пароль');
      return;
    }

    setLoading(true);

    try {
      const result = await login({ email: identifier.trim().toLowerCase(), password });
      setLoading(false);

      if (result && result.success) {
        navigate('/', { replace: true });
      } else {
        setError(result?.message || 'Неверный email/username или пароль');
      }
    } catch (err) {
      setLoading(false);
      setError('Сервер недоступен. Проверьте, запущен ли бэкенд на порту 5001');
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      setError('');
      setLoading(true);
      try {
        const result = await googleAuth(response.access_token);
        setLoading(false);
        if (result && result.success) {
          navigate('/', { replace: true });
        } else {
          setError(result?.message || 'Ошибка Google авторизации');
        }
      } catch (err) {
        setLoading(false);
        setError('Ошибка при авторизации через Google');
      }
    },
    onError: () => {
      setLoading(false);
      setError('Ошибка Google авторизации');
    },
    flow: 'implicit',
    scope: 'openid email profile',
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#fff', padding: '20px' }}>
      <div style={{ maxWidth: '400px', width: '100%', padding: '40px', background: '#111', borderRadius: '12px', border: '1px solid #333' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>
          <span style={{ color: '#fff' }}>Nor</span><span style={{ color: '#f97316' }}>Chat</span>
        </h1>
        <p style={{ color: '#888', marginBottom: '24px' }}>Войдите в свой аккаунт</p>

        {error && (
          <div style={{ padding: '12px', background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.3)', borderRadius: '8px', color: '#ff6b6b', marginBottom: '16px', fontSize: '14px' }}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#aaa', fontSize: '14px', marginBottom: '6px' }}>Email или Username</label>
            <input
              type="text"
              placeholder="email@example.com или username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '16px', outline: 'none' }}
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#aaa', fontSize: '14px', marginBottom: '6px' }}>Пароль</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '16px', outline: 'none' }}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            style={{ width: '100%', padding: '14px', background: '#f97316', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#333' }} />
          <span style={{ color: '#666', fontSize: '14px' }}>или</span>
          <div style={{ flex: 1, height: '1px', background: '#333' }} />
        </div>

        <button 
          type="button" 
          onClick={() => googleLogin()} 
          disabled={loading}
          style={{ width: '100%', padding: '14px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.4 1.7 14.9 1 12 1 7.7 1 4 3.5 2.2 7.1l3.7 2.8C6.8 7.3 9.2 5 12 5z"/>
            <path fill="#4285F4" d="M22.6 12.3c0-.8-.1-1.5-.2-2.3H12v4.3h5.9c-.3 1.4-1.1 2.6-2.2 3.3l3.6 2.8c2.1-1.9 3.3-4.7 3.3-8.1z"/>
            <path fill="#FBBC05" d="M5.9 14.1c-.2-.7-.4-1.4-.4-2.1s.2-1.4.4-2.1L2.2 7.1C1.4 8.6 1 10.2 1 12s.4 3.4 1.2 4.9l3.7-2.8z"/>
            <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.8c-1 .7-2.2 1.1-3.7 1.1-2.8 0-5.2-1.9-6.1-4.5L2.2 17C4 20.5 7.7 23 12 23z"/>
          </svg>
          Войти через Google
        </button>

        <div style={{ marginTop: '16px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <Link to="/register" style={{ color: '#f97316', textDecoration: 'none', fontSize: '14px' }}>Создать аккаунт</Link>
          <Link to="/forgot-password" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>Забыли пароль?</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;