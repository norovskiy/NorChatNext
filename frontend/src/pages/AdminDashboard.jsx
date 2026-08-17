import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

// Универсальная функция определения сетевого и аккаунт-статуса пользователя
const getUserOnlineStatus = (user) => {
  if (!user) {
    return {
      label: 'Неизвестно',
      color: 'bg-zinc-600',
      textColor: 'text-zinc-400',
      borderColor: 'border-zinc-700/50',
      glowColor: 'shadow-none',
      isOnline: false,
    };
  }

  if (user.isBanned) {
    return {
      label: 'Забанен',
      color: 'bg-red-500',
      textColor: 'text-red-400',
      borderColor: 'border-red-500/40',
      glowColor: 'shadow-[0_0_12px_rgba(239,68,68,0.4)]',
      isOnline: false,
    };
  }

  // Проверка флага isOnline или текстового статуса 'online'
  const isOnline = Boolean(user.isOnline || user.status === 'online');

  if (isOnline) {
    return {
      label: 'В сети',
      color: 'bg-emerald-500',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/40',
      glowColor: 'shadow-[0_0_12px_rgba(16,185,129,0.5)]',
      isOnline: true,
    };
  }

  return {
    label: 'Офлайн',
    color: 'bg-zinc-600',
    textColor: 'text-zinc-400',
    borderColor: 'border-zinc-800',
    glowColor: 'shadow-none',
    isOnline: false,
  };
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const {
    user: currentUser,
    adminSearchUsers,
    adminBanUser,
    adminUnbanUser,
    adminGiveCoins,
    adminGrantSubscription,
    adminDeleteUser
  } = useAuthStore();

  const isOwner = currentUser?.role === 'owner';

  // Поисковое состояние
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Состояния модальных окон
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeModal, setActiveModal] = useState(null);

  // Формы действий
  const [banReason, setBanReason] = useState('');
  const [banDays, setBanDays] = useState('7');
  const [coinAmount, setCoinAmount] = useState('');
  const [subPlan, setSubPlan] = useState('PLUS');
  const [subDuration, setSubDuration] = useState('30');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showNotification = (type, text) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
  };

  // Функция выполнения поиска
  const executeSearch = useCallback(async (queryText) => {
    setIsSearching(true);
    const res = await adminSearchUsers(queryText);
    setIsSearching(false);

    if (res.success) {
      setUsers(res.users || []);
    } else {
      showNotification('error', res.message);
    }
  }, [adminSearchUsers]);

  // Загрузка пользователей при монтировании компонента
  useEffect(() => {
    executeSearch('');
  }, [executeSearch]);

  // Живой поиск при вводе в инпут
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    executeSearch(value);
  };

  const openActionModal = (targetUser, modalType) => {
    setSelectedUser(targetUser);
    setActiveModal(modalType);
    setBanReason('');
    setCoinAmount('');
  };

  const closeModal = () => {
    setSelectedUser(null);
    setActiveModal(null);
  };

  // Статистика сети
  const networkStats = useMemo(() => {
    const total = users.length;
    const online = users.filter(u => getUserOnlineStatus(u).isOnline).length;
    const banned = users.filter(u => u.isBanned).length;
    return { total, online, banned };
  }, [users]);

  // Действие: Бан
  const handleBan = async () => {
    if (!isOwner && !banReason.trim()) {
      showNotification('error', 'Admin обязан указать причину бана!');
      return;
    }

    setIsSubmitting(true);
    let bannedUntil = null;
    if (banDays !== 'permanent') {
      const date = new Date();
      date.setDate(date.getDate() + Number(banDays));
      bannedUntil = date.toISOString();
    }

    const res = await adminBanUser({
      userId: selectedUser._id,
      reason: banReason,
      bannedUntil
    });

    setIsSubmitting(false);

    if (res.success) {
      showNotification('success', res.data.message);
      setUsers(users.map(u => u._id === selectedUser._id ? { ...u, isBanned: true, banReason } : u));
      closeModal();
    } else {
      showNotification('error', res.message);
    }
  };

  // Действие: Разбан
  const handleUnban = async (targetUser) => {
    setIsSubmitting(true);
    const res = await adminUnbanUser({ userId: targetUser._id });
    setIsSubmitting(false);

    if (res.success) {
      showNotification('success', res.data.message || `Пользователь ${targetUser.username} разблокирован`);
      setUsers(users.map(u => u._id === targetUser._id ? { ...u, isBanned: false, banReason: null, bannedUntil: null } : u));
    } else {
      showNotification('error', res.message);
    }
  };

  // Действие: Начисление NorCoins
  const handleGiveCoins = async () => {
    const amount = Number(coinAmount);
    if (!amount || amount <= 0) {
      showNotification('error', 'Введите корректную сумму NorCoins');
      return;
    }

    if (!isOwner && amount > 10000) {
      showNotification('error', 'Лимит Admin — не более 10,000 NorCoins!');
      return;
    }

    setIsSubmitting(true);
    const res = await adminGiveCoins({ userId: selectedUser._id, amount });
    setIsSubmitting(false);

    if (res.success) {
      showNotification('success', res.data.message);
      setUsers(users.map(u => u._id === selectedUser._id ? { ...u, norCoins: res.data.newBalance } : u));
      closeModal();
    } else {
      showNotification('error', res.message);
    }
  };

  // Действие: Выдача подписки (Owner)
  const handleGrantSub = async () => {
    setIsSubmitting(true);
    const res = await adminGrantSubscription({
      userId: selectedUser._id,
      plan: subPlan,
      durationDays: Number(subDuration)
    });
    setIsSubmitting(false);

    if (res.success) {
      showNotification('success', `Подписка ${subPlan} успешно выдана пользователю ${selectedUser.username}`);
      setUsers(users.map(u => u._id === selectedUser._id ? { ...u, subscription: subPlan } : u));
      closeModal();
    } else {
      showNotification('error', res.message);
    }
  };

  // Действие: Удаление (Owner)
  const handleDeleteUser = async () => {
    setIsSubmitting(true);
    const res = await adminDeleteUser(selectedUser._id);
    setIsSubmitting(false);

    if (res.success) {
      showNotification('success', res.data.message);
      setUsers(users.filter(u => u._id !== selectedUser._id));
      closeModal();
    } else {
      showNotification('error', res.message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-orange-500/30 selection:text-orange-300 p-4 sm:p-8 font-sans">
      
      {/* Шапка управления */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-orange-500/20">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-[0_0_20px_rgba(249,115,22,0.4)]">
              Nor<span className="text-orange-500">Chat</span> Admin
            </h1>
            <span className={`px-3 py-1 text-xs font-black rounded-full uppercase tracking-wider border backdrop-blur-md shadow-lg transition-all ${
              isOwner 
                ? 'bg-red-500/10 text-red-400 border-red-500/50 shadow-red-500/20' 
                : 'bg-orange-500/10 text-orange-400 border-orange-500/50 shadow-orange-500/20'
            }`}>
              {isOwner ? '👑 Owner (God Mode)' : '🛡️ Admin'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1.5">
            Панель управления пользователями, балансом NorCoins и модерацией.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => navigate('/')}
            className="w-full md:w-auto px-5 py-2.5 bg-zinc-900/80 hover:bg-orange-500/10 border border-orange-500/30 hover:border-orange-500/60 rounded-xl text-xs sm:text-sm font-semibold text-zinc-200 hover:text-orange-400 transition-all duration-200 shadow-lg active:scale-95 flex items-center justify-center gap-2"
          >
            <span>←</span> Вернуться на главную
          </button>
        </div>
      </div>

      {/* Панель общей сетевой статистики */}
      <div className="max-w-7xl mx-auto mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-950/80 border border-orange-500/20 hover:border-orange-500/40 rounded-2xl p-4 flex items-center justify-between shadow-lg transition-all">
          <div>
            <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Всего в базе</div>
            <div className="text-2xl font-black text-white mt-1 font-mono">{networkStats.total}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 text-lg">
            👥
          </div>
        </div>

        <div className="bg-zinc-950/80 border border-emerald-500/20 hover:border-emerald-500/40 rounded-2xl p-4 flex items-center justify-between shadow-lg transition-all">
          <div>
            <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Игроков в сети</div>
            <div className="text-2xl font-black text-emerald-400 mt-1 font-mono flex items-center gap-2">
              {networkStats.online}
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-lg">
            ⚡
          </div>
        </div>

        <div className="bg-zinc-950/80 border border-red-500/20 hover:border-red-500/40 rounded-2xl p-4 flex items-center justify-between shadow-lg transition-all">
          <div>
            <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Заблокировано</div>
            <div className="text-2xl font-black text-red-400 mt-1 font-mono">{networkStats.banned}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 text-lg">
            🚫
          </div>
        </div>
      </div>

      {/* Уведомления */}
      {statusMessage.text && (
        <div className={`max-w-7xl mx-auto my-5 p-4 rounded-xl text-xs sm:text-sm font-semibold border backdrop-blur-md flex items-center justify-between shadow-xl transition-all animate-in fade-in slide-in-from-top-2 ${
          statusMessage.type === 'error'
            ? 'bg-red-500/10 border-red-500/40 text-red-400 shadow-red-500/10'
            : statusMessage.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-emerald-500/10'
            : 'bg-orange-500/10 border-orange-500/40 text-orange-400 shadow-orange-500/10'
        }`}>
          <div className="flex items-center gap-2">
            <span>{statusMessage.type === 'error' ? '❌' : statusMessage.type === 'success' ? '✅' : 'ℹ️'}</span>
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage({ type: '', text: '' })} className="text-zinc-400 hover:text-white transition-colors">✕</button>
        </div>
      )}

      {/* Живой поиск */}
      <div className="max-w-7xl mx-auto mt-6">
        <div className="relative flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder="Живой поиск по нику, имени, email или ID..."
            className="w-full bg-zinc-950/90 border border-orange-500/30 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-2xl px-5 py-3.5 pr-12 text-white placeholder-zinc-500 focus:outline-none transition-all duration-200 text-sm shadow-inner"
          />
          <div className="absolute right-4 flex items-center gap-2">
            {isSearching ? (
              <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="text-zinc-500 text-base">🔍</span>
            )}
          </div>
        </div>
      </div>

      {/* Таблица пользователей */}
      <div className="max-w-7xl mx-auto mt-6">
        {users.length > 0 ? (
          <div className="bg-zinc-950/90 border border-orange-500/20 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-black/60 text-zinc-400 border-b border-orange-500/20 uppercase text-[11px] tracking-wider font-bold">
                  <tr>
                    <th className="px-6 py-4">Пользователь</th>
                    <th className="px-6 py-4">Сетевой Статус</th>
                    <th className="px-6 py-4">Роль</th>
                    <th className="px-6 py-4">Подписка</th>
                    <th className="px-6 py-4">NorCoins</th>
                    <th className="px-6 py-4 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/80">
                  {users.map((u) => {
                    const status = getUserOnlineStatus(u);
                    return (
                      <tr key={u._id} className="hover:bg-orange-500/[0.03] transition-colors duration-150">
                        
                        {/* Пользователь */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3.5">
                            <div className="relative">
                              <img
                                src={u.avatar || 'https://via.placeholder.com/40'}
                                alt={u.username}
                                className="w-11 h-11 rounded-full object-cover border border-orange-500/30 shadow-md"
                              />
                              {/* Пульсирующий индикатор онлайна */}
                              <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-black ${status.color} ${status.glowColor}`}>
                                {status.isOnline && (
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                )}
                              </span>
                            </div>
                            <div>
                              <div className="font-bold text-white text-base flex items-center gap-2">
                                {u.nickname || u.username}
                              </div>
                              <div className="text-xs text-zinc-400 font-mono">
                                @{u.username} <span className="text-zinc-600">•</span> {u.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Сетевой Статус с использованием функции */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border ${status.textColor} ${status.borderColor} bg-black/40 ${status.glowColor}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.color}`} />
                            {status.label}
                          </span>
                        </td>

                        {/* Роль */}
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-lg uppercase tracking-wider ${
                            u.role === 'owner' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                            u.role === 'admin' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' :
                            'bg-zinc-800/80 text-zinc-300 border border-zinc-700/50'
                          }`}>
                            {u.role}
                          </span>
                        </td>

                        {/* Подписка */}
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 text-xs font-extrabold rounded-lg tracking-wider border ${
                            u.subscription === 'PREMIUM' ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' :
                            u.subscription === 'VIP' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                            u.subscription === 'PLUS' ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' :
                            'bg-zinc-900 text-zinc-500 border-zinc-800'
                          }`}>
                            {u.subscription || 'FREE'}
                          </span>
                        </td>

                        {/* NorCoins */}
                        <td className="px-6 py-4 font-mono font-black text-amber-400 text-base">
                          🪙 {u.norCoins || 0}
                        </td>

                        {/* Действия */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openActionModal(u, 'coins')}
                              className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95"
                            >
                              + Coins
                            </button>

                            {isOwner && (
                              <button
                                onClick={() => openActionModal(u, 'sub')}
                                className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95"
                              >
                                👑 Подписка
                              </button>
                            )}

                            {/* Кнопка Бан / Разбанить */}
                            {u.isBanned ? (
                              <button
                                onClick={() => handleUnban(u)}
                                disabled={isSubmitting}
                                className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                              >
                                Разбанить
                              </button>
                            ) : (
                              <button
                                onClick={() => openActionModal(u, 'ban')}
                                className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95"
                              >
                                Бан
                              </button>
                            )}

                            {isOwner && u.role !== 'owner' && (
                              <button
                                onClick={() => openActionModal(u, 'delete')}
                                className="px-2.5 py-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-700/50 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95"
                                title="Удалить из БД"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-zinc-950/60 border border-orange-500/20 rounded-2xl backdrop-blur-md">
            <p className="text-zinc-400 text-sm font-medium">Пользователи не найдены.</p>
          </div>
        )}
      </div>

      {/* Модальные окна */}
      {activeModal && selectedUser && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-orange-500/30 rounded-2xl max-w-md w-full p-6 relative shadow-[0_0_50px_rgba(249,115,22,0.15)]">
            <button 
              onClick={closeModal} 
              className="absolute top-4 right-4 text-zinc-500 hover:text-white text-lg transition-colors"
            >
              ✕
            </button>

            {/* Заголовок модалки с использованием общей функции статуса */}
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-zinc-800">
              <img src={selectedUser.avatar} alt="" className="w-10 h-10 rounded-full border border-orange-500/30" />
              <div>
                <div className="font-bold text-white text-sm">{selectedUser.username}</div>
                <div className="text-xs text-zinc-400">
                  Статус: <span className={getUserOnlineStatus(selectedUser).textColor}>{getUserOnlineStatus(selectedUser).label}</span>
                </div>
              </div>
            </div>

            {/* Модалка бана */}
            {activeModal === 'ban' && (
              <div>
                <h3 className="text-xl font-black text-red-400 mb-1">Блокировка {selectedUser.username}</h3>
                <p className="text-xs text-zinc-400 mb-4">
                  {!isOwner ? '⚠️ Причина обязательна для Admin.' : 'Owner может забанить с причиной или без.'}
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Причина блокировки</label>
                    <textarea
                      value={banReason}
                      onChange={(e) => setBanReason(e.target.value)}
                      placeholder={isOwner ? 'Причина (опционально)...' : 'Укажите причину блокировки...'}
                      className="w-full bg-black border border-zinc-800 focus:border-red-500 rounded-xl p-3 text-sm text-white focus:outline-none h-24 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Срок бана</label>
                    <select
                      value={banDays}
                      onChange={(e) => setBanDays(e.target.value)}
                      className="w-full bg-black border border-zinc-800 focus:border-red-500 rounded-xl p-3 text-sm text-white focus:outline-none transition-all"
                    >
                      <option value="1">1 день</option>
                      <option value="7">7 дней</option>
                      <option value="30">30 дней</option>
                      <option value="permanent">Навсегда (Пермабан)</option>
                    </select>
                  </div>

                  <button
                    onClick={handleBan}
                    disabled={isSubmitting}
                    className="w-full py-3 bg-red-600 hover:bg-red-500 font-bold text-white rounded-xl transition-all text-sm disabled:opacity-50 shadow-lg shadow-red-600/30 active:scale-95"
                  >
                    Заблокировать
                  </button>
                </div>
              </div>
            )}

            {/* Модалка NorCoins */}
            {activeModal === 'coins' && (
              <div>
                <h3 className="text-xl font-black text-amber-400 mb-1">Начисление NorCoins</h3>
                <p className="text-xs text-zinc-400 mb-4">
                  Пользователь: <span className="text-white font-bold">{selectedUser.username}</span>
                  {!isOwner && <span className="block text-amber-400/90 font-semibold mt-1">Максимум 10,000 NC за один запрос</span>}
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Количество NorCoins</label>
                    <input
                      type="number"
                      value={coinAmount}
                      onChange={(e) => setCoinAmount(e.target.value)}
                      placeholder="Например: 500"
                      className="w-full bg-black border border-zinc-800 focus:border-amber-500 rounded-xl p-3 text-sm text-white focus:outline-none transition-all font-mono"
                    />
                  </div>

                  <button
                    onClick={handleGiveCoins}
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 font-bold text-black rounded-xl transition-all text-sm disabled:opacity-50 shadow-lg shadow-orange-500/30 active:scale-95"
                  >
                    Выдать Coins
                  </button>
                </div>
              </div>
            )}

            {/* Модалка подписки */}
            {activeModal === 'sub' && (
              <div>
                <h3 className="text-xl font-black text-purple-400 mb-1">👑 Подарить подписку</h3>
                <p className="text-xs text-zinc-400 mb-4">
                  Бесплатное повышение статуса от имени Owner с авто-уведомлением.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Тарифный план</label>
                    <select
                      value={subPlan}
                      onChange={(e) => setSubPlan(e.target.value)}
                      className="w-full bg-black border border-zinc-800 focus:border-purple-500 rounded-xl p-3 text-sm text-white focus:outline-none transition-all"
                    >
                      <option value="PLUS">PLUS</option>
                      <option value="VIP">VIP</option>
                      <option value="PREMIUM">PREMIUM</option>
                      <option value="FREE">Сбросить до FREE</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Длительность (дней)</label>
                    <input
                      type="number"
                      value={subDuration}
                      onChange={(e) => setSubDuration(e.target.value)}
                      placeholder="30"
                      className="w-full bg-black border border-zinc-800 focus:border-purple-500 rounded-xl p-3 text-sm text-white focus:outline-none transition-all font-mono"
                    />
                  </div>

                  <button
                    onClick={handleGrantSub}
                    disabled={isSubmitting}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-500 font-bold text-white rounded-xl transition-all text-sm disabled:opacity-50 shadow-lg shadow-purple-600/30 active:scale-95"
                  >
                    Подарить подписку
                  </button>
                </div>
              </div>
            )}

            {/* Модалка удаления */}
            {activeModal === 'delete' && (
              <div>
                <h3 className="text-xl font-black text-red-500 mb-2">🔴 Безвозвратное удаление</h3>
                <p className="text-sm text-zinc-300 mb-5">
                  Удалить профиль <strong className="text-white">{selectedUser.username}</strong> из базы данных?
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={closeModal}
                    className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 font-bold text-white rounded-xl transition-all text-sm"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleDeleteUser}
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-500 font-bold text-white rounded-xl transition-all text-sm disabled:opacity-50 shadow-lg shadow-red-600/30 active:scale-95"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;