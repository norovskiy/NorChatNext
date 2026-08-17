import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, ShoppingBag, Package, Check, Crown, Zap, Sparkles } from 'lucide-react';

const API_BASE = '/api/store';

const RARITY_STYLES = {
  common: { label: 'COMMON', color: 'text-slate-400', bg: 'bg-slate-500/15', border: 'border-slate-500/30' },
  epic: { label: 'EPIC', color: 'text-purple-400', bg: 'bg-purple-500/15', border: 'border-purple-500/30' },
  legendary: { label: 'LEGENDARY', color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30' },
  vip: { label: 'VIP', color: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/30' },
};

const CATEGORIES = [
  { key: 'all', label: 'Все' },
  { key: 'frame', label: 'Рамки' },
  { key: 'background', label: 'Фоны' },
  { key: 'subscription', label: 'Подписки' },
  { key: 'gift', label: 'Подарки' },
];

// Вспомогательная функция проверки URL для тега <img>
const isValidImageUrl = (url) => {
  if (typeof url !== 'string' || !url) return false;
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/') || url.startsWith('data:image/');
};

export default function StoreModal({ isOpen, onClose, user, onUserUpdate }) {
  const [activeTab, setActiveTab] = useState('catalog');
  const [category, setCategory] = useState('all');
  const [items, setItems] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [giftTargetItem, setGiftTargetItem] = useState(null);
  const [recipientId, setRecipientId] = useState('');

  const getAuthHeader = () => {
    const token = localStorage.getItem('norchat_token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  const generateIdempotencyKey = () =>
    'idemp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 11);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/items`, { headers: getAuthHeader() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Ошибка загрузки каталога');
      setItems(data.items || data || []);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/inventory`, { headers: getAuthHeader() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Ошибка загрузки инвентаря');
      setInventory(data.inventory || data || []);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchItems();
      fetchInventory();
      setMessage({ type: '', text: '' });
    }
  }, [isOpen]);

  const handlePurchase = async (itemId) => {
    try {
      setActionLoading(itemId);
      setMessage({ type: '', text: '' });

      const res = await fetch(`${API_BASE}/purchase`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ itemId, idempotencyKey: generateIdempotencyKey() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Ошибка при совершении покупки');

      setMessage({ type: 'success', text: data.message || 'Покупка успешно совершена!' });
      
      fetchInventory();

      if (onUserUpdate) {
        onUserUpdate(data.user || { ...user, norCoins: data.newBalance });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  const handleEquip = async (inventoryItem) => {
    const invId = inventoryItem._id;
    const itemId = typeof inventoryItem.itemId === 'object' ? inventoryItem.itemId?._id : inventoryItem.itemId;

    try {
      setActionLoading(invId);
      setMessage({ type: '', text: '' });

      const res = await fetch(`${API_BASE}/equip`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ inventoryItemId: invId, itemId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Ошибка изменения статуса предмета');

      setMessage({ type: 'success', text: data.message || 'Статус предмета обновлен!' });
      
      fetchInventory();

      if (data.user && onUserUpdate) {
        onUserUpdate(data.user);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendGift = async (e) => {
    e.preventDefault();
    if (!recipientId.trim() || !giftTargetItem) return;

    try {
      setActionLoading('gift');
      setMessage({ type: '', text: '' });

      const res = await fetch(`${API_BASE}/gift`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({
          itemId: giftTargetItem._id,
          recipientId: recipientId.trim(),
          toUserId: recipientId.trim(),
          idempotencyKey: generateIdempotencyKey(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Ошибка отправки подарка');

      setMessage({ type: 'success', text: data.message || 'Подарок успешно отправлен!' });
      setGiftTargetItem(null);
      setRecipientId('');

      if (data.newBalance !== undefined && onUserUpdate) {
        onUserUpdate({ ...user, norCoins: data.newBalance });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  if (!isOpen) return null;

  const filteredItems = items.filter((item) => category === 'all' || item.type === category);

  // Приведение ID к строке для корректного поиска в Set
  const ownedItemIds = new Set(
    inventory.map((i) => String(typeof i.itemId === 'object' ? i.itemId?._id : i.itemId))
  );

  const renderItemMedia = (item) => {
    const isSub = item.type === 'subscription';
    if (isSub) {
      return (
        <div className="flex flex-col items-center justify-center">
          {item.planKey === 'plus' && <Zap size={36} className="text-blue-400" />}
          {item.planKey === 'vip' && <Crown size={36} className="text-amber-400" />}
          {item.planKey === 'premium' && <Sparkles size={36} className="text-purple-400" />}
        </div>
      );
    }

    const mediaUrl = item.assetUrl || item.thumbnailUrl;
    if (isValidImageUrl(mediaUrl)) {
      return (
        <img
          src={mediaUrl}
          alt={item.name || 'Товар'}
          className="max-h-full max-w-full rounded-lg object-contain"
        />
      );
    }

    // Если assetUrl содержал CSS-градиент или класс вместо картинки
    return (
      <div
        className="h-16 w-16 rounded-full flex items-center justify-center text-xs text-white/50 border border-white/10"
        style={{ background: mediaUrl?.includes('gradient') ? mediaUrl : undefined }}
      >
        {!mediaUrl?.includes('gradient') && (item.name ? item.name[0] : '✨')}
      </div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative flex h-[85vh] max-h-[680px] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#141414] to-[#0a0a0a] shadow-2xl shadow-black/60"
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <div className="flex items-center gap-4">
              <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                <ShoppingBag size={20} className="text-orange-500" />
                Магазин <span className="text-orange-500">NorChat</span>
              </h2>
              <div className="flex items-center gap-1.5 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-sm font-semibold text-orange-400">
                🪙 {user?.norCoins ?? 0} NC
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-white/40 transition hover:bg-white/10 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Message Banner */}
          <AnimatePresence>
            {message.text && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`mx-6 mt-3 overflow-hidden rounded-lg border px-4 py-2 text-sm ${
                  message.type === 'error'
                    ? 'border-red-500/30 bg-red-500/10 text-red-400'
                    : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                }`}
              >
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tabs */}
          <div className="flex gap-6 border-b border-white/10 px-6">
            {[
              { key: 'catalog', label: 'Каталог' },
              { key: 'inventory', label: `Мой инвентарь (${inventory.length})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative py-3 text-sm font-medium transition ${
                  activeTab === tab.key ? 'text-white' : 'text-white/40 hover:text-white/70'
                }`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="storeTabIndicator"
                    className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-orange-500"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Categories */}
          {activeTab === 'catalog' && (
            <div className="flex gap-2 overflow-x-auto px-6 py-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setCategory(cat.key)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                    category === cat.key
                      ? 'bg-orange-500 text-black'
                      : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-white/40">
                Загрузка данных с сервера...
              </div>
            ) : activeTab === 'catalog' ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {filteredItems.length === 0 ? (
                  <div className="col-span-full py-16 text-center text-sm text-white/30">
                    Товары не найдены
                  </div>
                ) : (
                  filteredItems.map((item) => {
                    const isOwned = ownedItemIds.has(String(item._id)) && !item.stackable && item.type !== 'subscription';
                    const rarity = RARITY_STYLES[item.rarity];
                    const isSub = item.type === 'subscription';
                    const activePlan = user?.subscription?.plan?.toLowerCase();
                    const isCurrentSub = isSub && activePlan === item.planKey?.toLowerCase();

                    return (
                      <div
                        key={item._id}
                        className="group relative flex flex-col rounded-xl border border-white/10 bg-white/[0.03] p-3 transition hover:border-orange-500/30 hover:bg-white/[0.05]"
                      >
                        {rarity && (
                          <span
                            className={`absolute left-2 top-2 rounded border px-1.5 py-0.5 text-[9px] font-bold tracking-wide ${rarity.bg} ${rarity.color} ${rarity.border}`}
                          >
                            {rarity.label}
                          </span>
                        )}

                        <div className="flex h-24 items-center justify-center py-2 relative">
                          {renderItemMedia(item)}
                        </div>

                        <div className="mb-2 text-center">
                          <h4 className="truncate text-sm font-medium text-white/90">{item.name}</h4>
                          <div className="text-xs font-semibold text-orange-400">🪙 {item.price} NC</div>
                        </div>

                        <div className="flex gap-1.5">
                          {isOwned || isCurrentSub ? (
                            <button
                              disabled
                              className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-white/5 py-2 text-xs text-white/30"
                            >
                              <Check size={12} /> {isCurrentSub ? 'Активно' : 'Куплено'}
                            </button>
                          ) : (
                            <button
                              disabled={actionLoading === item._id}
                              onClick={() => handlePurchase(item._id)}
                              className="flex-1 rounded-lg bg-orange-500 py-2 text-xs font-semibold text-black transition hover:bg-orange-400 disabled:opacity-50"
                            >
                              {actionLoading === item._id ? '...' : 'Купить'}
                            </button>
                          )}

                          {!isSub && (
                            <button
                              onClick={() => setGiftTargetItem(item)}
                              title="Подарить другу"
                              className="rounded-lg bg-white/5 px-2.5 text-white/60 transition hover:bg-white/10 hover:text-orange-400"
                            >
                              <Gift size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {inventory.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center gap-2 py-16 text-center text-sm text-white/30">
                    <Package size={28} className="text-white/15" />
                    Инвентарь пуст
                  </div>
                ) : (
                  inventory.map((inv) => {
                    const item = typeof inv.itemId === 'object' ? inv.itemId : {};
                    return (
                      <div
                        key={inv._id}
                        className="flex flex-col rounded-xl border border-white/10 bg-white/[0.03] p-3"
                      >
                        <div className="flex h-24 items-center justify-center py-2">
                          {renderItemMedia(item)}
                        </div>

                        <div className="mb-2 text-center">
                          <h4 className="truncate text-sm font-medium text-white/90">
                            {item?.name || 'Предмет'}
                          </h4>
                          {inv.equipped && (
                            <span className="text-[11px] font-semibold text-orange-400">Надето</span>
                          )}
                        </div>

                        <button
                          disabled={actionLoading === inv._id}
                          onClick={() => handleEquip(inv)}
                          className={`rounded-lg py-2 text-xs font-semibold transition disabled:opacity-50 ${
                            inv.equipped
                              ? 'bg-white/10 text-white/70 hover:bg-white/15'
                              : 'bg-orange-500 text-black hover:bg-orange-400'
                          }`}
                        >
                          {actionLoading === inv._id ? '...' : inv.equipped ? 'Снять' : 'Надеть'}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Gift Sub-modal */}
          <AnimatePresence>
            {giftTargetItem && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black/80 p-5 backdrop-blur-sm"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  className="w-full max-w-sm rounded-xl border border-white/10 bg-[#141414] p-6"
                >
                  <h3 className="flex items-center gap-2 text-base font-semibold text-white">
                    <Gift size={16} className="text-orange-500" />
                    Подарить «{giftTargetItem.name}»
                  </h3>
                  <p className="mt-1 text-sm text-white/40">
                    Стоимость: <span className="text-orange-400">🪙 {giftTargetItem.price} NC</span>
                  </p>

                  <form onSubmit={handleSendGift}>
                    <input
                      type="text"
                      placeholder="ID или имя получателя"
                      value={recipientId}
                      onChange={(e) => setRecipientId(e.target.value)}
                      required
                      className="my-4 w-full rounded-lg border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-orange-500/50"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setGiftTargetItem(null)}
                        className="rounded-lg bg-white/5 px-4 py-2 text-sm text-white/70 transition hover:bg-white/10"
                      >
                        Отмена
                      </button>
                      <button
                        type="submit"
                        disabled={actionLoading === 'gift'}
                        className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-orange-400 disabled:opacity-50"
                      >
                        {actionLoading === 'gift' ? 'Отправка...' : 'Отправить'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}