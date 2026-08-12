import React, { useState } from 'react';
import { X } from 'lucide-react';

const ProfileModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [nickname, setNickname] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!nickname || nickname.length < 2) {
      setError('Никнейм должен быть минимум 2 символа');
      return;
    }

    if (!birthDate) {
      setError('Выберите дату рождения');
      return;
    }

    const age = new Date().getFullYear() - new Date(birthDate).getFullYear();
    if (age < 16) {
      setError('Вам должно быть 16 лет или больше');
      return;
    }

    const result = await onSubmit({ nickname, birthDate });
    if (result.success) {
      onClose();
    } else {
      setError(result.message || 'Ошибка сохранения');
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

        <h2 style={{ color: '#fff', marginBottom: '8px' }}>👤 Заполните профиль</h2>
        <p style={{ color: '#888', fontSize: '14px', marginBottom: '24px' }}>
          Укажите ваши данные для продолжения
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

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#aaa', fontSize: '14px', marginBottom: '6px' }}>
              Nickname
            </label>
            <input
              type="text"
              placeholder="Ваш никнейм"
              value={nickname}
              onChange={(e) => setNickname(e.target.value.slice(0, 16))}
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
              minLength={2}
              maxLength={16}
            />
            <div style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
              {nickname.length}/16 символов
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#aaa', fontSize: '14px', marginBottom: '6px' }}>
              Дата рождения
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={new Date(new Date().setFullYear(new Date().getFullYear() - 16)).toISOString().split('T')[0]}
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
            />
            <div style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
              Минимальный возраст: 16 лет
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
            {isLoading ? 'Сохранение...' : 'Продолжить'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;