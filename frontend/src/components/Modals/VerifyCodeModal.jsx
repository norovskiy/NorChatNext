import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VerifyCodeModal = ({ isOpen, onClose, onVerify, email, isLoading }) => {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);

  console.log('🔥 VerifyCodeModal isOpen:', isOpen);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (code.length !== 6) {
      setError('Код должен быть 6 цифр');
      return;
    }

    setVerifying(true);
    const result = await onVerify(email, code);
    setVerifying(false);
    
    console.log('🔥 VERIFY RESULT:', result);
    
    if (result.success) {
      onClose();
      navigate('/', { replace: true });
    } else {
      setError(result.message || 'Неверный код');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px',
    }}>
      <div style={{
        maxWidth: '420px',
        width: '100%',
        padding: '40px',
        background: '#111',
        borderRadius: '16px',
        border: '1px solid #333',
        position: 'relative',
        boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
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
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => e.target.style.color = '#fff'}
          onMouseLeave={(e) => e.target.style.color = '#666'}
        >
          <X size={22} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📧</div>
          <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: 'bold', marginBottom: '8px' }}>
            Подтверждение email
          </h2>
          <p style={{ color: '#888', fontSize: '14px', lineHeight: 1.5 }}>
            Мы отправили код подтверждения на <br />
            <strong style={{ color: '#f97316' }}>{email}</strong>
          </p>
        </div>

        {error && (
          <div style={{
            padding: '12px 16px',
            background: 'rgba(255,0,0,0.1)',
            border: '1px solid rgba(255,0,0,0.25)',
            borderRadius: '10px',
            color: '#ff6b6b',
            marginBottom: '20px',
            fontSize: '14px',
            textAlign: 'center',
          }}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: '#aaa', fontSize: '13px', marginBottom: '8px', fontWeight: '500' }}>
              Введите 6-значный код
            </label>
            <input
              type="text"
              placeholder="— — — — — —"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              style={{
                width: '100%',
                padding: '16px',
                background: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '28px',
                textAlign: 'center',
                letterSpacing: '12px',
                fontFamily: 'monospace',
                outline: 'none',
                transition: 'border-color 0.3s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#f97316'}
              onBlur={(e) => e.target.style.borderColor = '#333'}
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
            disabled={verifying || isLoading}
            style={{
              width: '100%',
              padding: '14px',
              background: '#f97316',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: (verifying || isLoading) ? 'not-allowed' : 'pointer',
              opacity: (verifying || isLoading) ? 0.6 : 1,
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              if (!verifying && !isLoading) {
                e.target.style.background = '#ea580c';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#f97316';
            }}
          >
            {verifying || isLoading ? (
              <>
                <span style={{
                  display: 'inline-block',
                  width: '18px',
                  height: '18px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
                Проверка...
              </>
            ) : (
              'Подтвердить и войти'
            )}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p style={{ color: '#555', fontSize: '13px' }}>
            Не пришёл код?{' '}
            <button
              type="button"
              onClick={() => {
                setError('');
                setCode('');
                alert('Функция повторной отправки будет добавлена позже');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#f97316',
                cursor: 'pointer',
                fontSize: '13px',
                textDecoration: 'underline',
                padding: '0',
              }}
            >
              Отправить снова
            </button>
          </p>
          <p style={{ color: '#444', fontSize: '12px', marginTop: '8px' }}>
            Проверьте папку <strong style={{ color: '#666' }}>Спам</strong>, если письмо не пришло
          </p>
        </div>

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default VerifyCodeModal;