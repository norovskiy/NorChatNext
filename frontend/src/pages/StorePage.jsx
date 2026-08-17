import React from 'react';
import { useNavigate } from 'react-router-dom';
import StoreModal from '../components/Modals/StoreModal';
import useAuthStore from '../store/useAuthStore';

export default function StorePage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <StoreModal
        isOpen={true}
        onClose={() => navigate(-1)} // Возвращает назад при закрытии
        user={user}
        onUserUpdate={(updatedUser) => setUser(updatedUser)}
      />
    </div>
  );
}