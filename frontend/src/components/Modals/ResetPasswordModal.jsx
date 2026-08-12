import React, { useState } from 'react';
import { X } from 'lucide-react';

const ResetPasswordModal = ({ isOpen, onClose, onSubmit, email, isLoading }) => {
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (code.length !== 6) {
      setError('Код должен быть 6 цифр');
      return;
    }

    if (newPassword.length < 6) {
      setError('Пароль должен быть минимум 6 символов');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    const result = await onSubmit({ email, code, newPassword });
    if (result.success) {
      setSuccess('✅ Пароль изменён!');
      setTimeout(onClose, 1500);
    } else {
      setError(result.message || 'Ошибка сброса пароля');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        padding: '40px',
        background: '#111',
        borderRadius: '16px',
        border: '1px solid #333',
        position: 'relative',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'none',
            border: 'none',
            color: '#666',
            cursor: 'pointer',
            fontSize: '20px',
          }}
        >
          <X size={20} />
        </button>

        <h2 style={{ color: '#fff', marginBottom: '8px' }}>🔑 Сброс пароля</h2>
        <p style={{ color: '#888', fontSize: '14px', marginBottom: '24px' }}>
          Введите код из письма и новый пароль
        </p>

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
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#aaa', fontSize: '14px', marginBottom: '6px' }}>
              Код из письма
            </label>
            <input
              type="text"
              placeholder="Введите 6-значный код"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              style={{
                width: '100%',
                padding: '12px',
                background: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '16px',
                textAlign: 'center',
                letterSpacing: '8px',
                fontFamily: 'monospace',
                outline: 'none',
              }}
              required
              maxLength={6}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#aaa', fontSize: '14px', marginBottom: '6px' }}>
              Новый пароль
            </label>
            <input
              type="password"
              placeholder="минимум 6 символов"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                background: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '16px',
                outline: 'none',
              }}
              required
              minLength={6}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#aaa', fontSize: '14px', marginBottom: '6px' }}>
              Подтвердите пароль
            </label>
            <input
              type="password"
              placeholder="повторите пароль"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                background: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '16px',
                outline: 'none',
              }}
              required
              minLength={6}
            />
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
            {isLoading ? 'Сохранение...' : 'Сохранить пароль'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordModal;