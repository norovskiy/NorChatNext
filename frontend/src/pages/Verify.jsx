import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const Verify = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const { verifyCode, isLoading, isAuthenticated } = useAuthStore();

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [devCode, setDevCode] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
    if (!email) {
      navigate('/register');
    }
  }, [isAuthenticated, email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (code.length !== 6) {
      setError('Код должен быть 6 цифр');
      return;
    }

    const result = await verifyCode({ email, code });

    if (result.success) {
      setSuccess('✅ Email подтверждён!');
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1000);
    } else {
      setError(result.message || 'Неверный код');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#000',
      color: '#fff',
      padding: '20px',
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        padding: '40px',
        background: '#111',
        borderRadius: '12px',
        border: '1px solid #333',
      }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>
          <span style={{ color: '#fff' }}>Nor</span>
          <span style={{ color: '#f97316' }}>Chat</span>
        </h1>
        <p style={{ color: '#888', marginBottom: '24px' }}>Подтверждение email</p>

        <div style={{
          padding: '12px',
          background: 'rgba(249,115,22,0.1)',
          border: '1px solid #f97316',
          borderRadius: '8px',
          color: '#f97316',
          marginBottom: '16px',
          fontSize: '14px',
          textAlign: 'center',
        }}>
          📧 Код отправлен на <strong>{email}</strong>
        </div>

        {error && (
          <div style={{
            padding: '12px',
            background: 'rgba(255,0,0,0.1)',
            border: '1px solid rgba(255,0,0,0.3)',
            borderRadius: '8px',
            color: '#ff6b6b',
            marginBottom: '16px',
            fontSize: '14px',
          }}>
            ❌ {error}
          </div>
        )}

        {success && (
          <div style={{
            padding: '12px',
            background: 'rgba(0,255,0,0.1)',
            border: '1px solid rgba(0,255,0,0.3)',
            borderRadius: '8px',
            color: '#51cf66',
            marginBottom: '16px',
            fontSize: '14px',
          }}>
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#aaa', fontSize: '14px', marginBottom: '6px' }}>
              Код подтверждения
            </label>
            <input
              type="text"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              style={{
                width: '100%',
                padding: '16px',
                background: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '28px',
                textAlign: 'center',
                letterSpacing: '12px',
                fontFamily: 'monospace',
                outline: 'none',
              }}
              required
              maxLength={6}
              autoFocus
            />
            <div style={{ color: '#555', fontSize: '12px', textAlign: 'center', marginTop: '8px' }}>
              {code.length}/6 символов
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '14px',
              background: '#f97316',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? 'Проверка...' : 'Подтвердить и войти'}
          </button>

          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <Link to="/register" style={{ color: '#666', textDecoration: 'none', fontSize: '14px' }}>
              ← Не пришёл код? Попробовать снова
            </Link>
            <br />
            <Link to="/login" style={{ color: '#666', textDecoration: 'none', fontSize: '14px', marginTop: '8px', display: 'inline-block' }}>
              ← Вернуться к входу
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Verify;