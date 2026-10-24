import React, { useState, useEffect } from 'react';
import { useGameStore, SHOP_CATALOG } from '../../stores/useGameStore';
import { useNpcStore } from '../../stores/useNpcStore';
import { Coins, ShoppingBag, Check, X, AlertCircle } from 'lucide-react';

export const StallsShopModal: React.FC = () => {
  const activeModal = useGameStore((s) => s.activeModal);
  const closeModal = useGameStore((s) => s.closeModal);
  const tokens = useGameStore((s) => s.tokens);
  const inventory = useGameStore((s) => s.inventory);
  const purchaseItem = useGameStore((s) => s.purchaseItem);
  const activeGreeting = useNpcStore((s) => s.activeGreeting);
  const activeShopCategory = useGameStore((s) => s.activeShopCategory);

  const [activeCategory, setActiveCategory] = useState<'all' | 'sweet' | 'snack' | 'diya' | 'handicraft'>(
    activeShopCategory || 'all'
  );
  const [lastPurchased, setLastPurchased] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-dismiss error message
  useEffect(() => {
    if (!errorMessage) return;
    const t = setTimeout(() => setErrorMessage(null), 4000);
    return () => clearTimeout(t);
  }, [errorMessage]);

  if (activeModal !== 'shop') return null;

  // Contextual vendor dialogue
  const vendorDialogue = activeGreeting
    ? {
        name: activeGreeting.vendorName,
        shop: activeGreeting.shopName,
        greeting: activeGreeting.text,
      }
    : activeCategory === 'sweet'
    ? {
        name: 'Ganesh Kaka',
        shop: 'Shree Ganesh Sweets',
        greeting: 'Namaste! Every mithai is prepared fresh with pure ghee and festive love.',
      }
    : activeCategory === 'snack'
    ? {
        name: 'Chander Bhaiya',
        shop: 'Old Delhi Chaat Bhandar',
        greeting: 'Garma-garam samosas, spicy kulhad chai, and tangy golgappe! Enjoy festive treats.',
      }
    : activeCategory === 'diya'
    ? {
        name: 'Artisan Suresh',
        shop: 'Festive Clay Diyas',
        greeting: 'Shubh Deepavali! May these glowing clay diyas bring light and joy to your home.',
      }
    : activeCategory === 'handicraft'
    ? {
        name: 'Shilpa Didi',
        shop: 'Akash Kandils & Keepsakes',
        greeting: 'Intricate handmade lanterns and festive crafts to brighten every threshold.',
      }
    : {
        name: 'Mela Vendors',
        shop: 'Diwali Bazaar',
        greeting: 'Welcome to the festive bazaar! Sweets, savory chaat, clay diyas, and handicrafts await you.',
      };

  const filteredItems = SHOP_CATALOG.filter((item) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'sweet') return item.category === 'sweet';
    if (activeCategory === 'snack') return item.category === 'snack';
    if (activeCategory === 'diya') return item.category === 'diya' || item.category === 'sparkler';
    return item.category === 'handicraft';
  });

  const handleBuy = (item: (typeof SHOP_CATALOG)[0]) => {
    if (tokens < item.price) {
      setErrorMessage(`You need ${item.price - tokens} more tokens to buy ${item.name}! Win tokens at Carnival games.`);
      return;
    }

    const success = purchaseItem(item.id);
    if (success) {
      setErrorMessage(null);
      setLastPurchased(item.id);
      setTimeout(() => setLastPurchased(null), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn select-none">
      <div className="relative max-w-2xl w-full max-h-[90vh] bg-gradient-to-b from-slate-900 via-festive-nightBlue to-slate-950 border-2 border-festive-gold/60 rounded-3xl shadow-2xl p-5 md:p-6 text-white flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/30">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🛍️</span>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-festive-gold to-festive-saffron">
                DIWALI MELA BAZAAR
              </h2>
              <div className="text-xs text-amber-200/80">Traditional Sweets, Savory Chaat, Clay Diyas & Keepsakes</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-800/90 border border-festive-gold/40 rounded-full py-1 px-3 text-xs font-mono">
              <Coins className="w-4 h-4 text-festive-gold" />
              <span className="font-bold text-festive-gold">{tokens}</span>
            </div>
            <button
              onClick={closeModal}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-gray-300 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Insufficient Funds / Feedback Toast */}
        {errorMessage && (
          <div
            data-testid="shop-error-toast"
            className="my-2 bg-red-950/80 border border-red-500/50 rounded-2xl p-2.5 px-3.5 flex items-center gap-2 text-xs text-red-200 animate-fadeIn"
          >
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Categories */}
        <div className="flex gap-2 my-2.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'sweet', label: 'Mithai & Sweets 🍯' },
            { id: 'snack', label: 'Chaat & Snacks 🥟' },
            { id: 'diya', label: 'Diyas & Sparklers 🪔' },
            { id: 'handicraft', label: 'Lanterns & Gifts 🏮' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id as any);
                setErrorMessage(null);
              }}
              className={`py-1.5 px-3 rounded-full font-bold transition-all shrink-0 cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-festive-gold to-festive-saffron text-amber-950 shadow-md'
                  : 'bg-slate-800/80 text-gray-300 hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Vendor Greeting Dialogue */}
        <div
          data-testid="shop-vendor-greeting"
          className="bg-amber-950/40 border border-amber-500/20 rounded-2xl p-2.5 px-3.5 mb-2 flex items-center gap-2.5 text-xs text-amber-100"
        >
          <span className="text-lg">🙏</span>
          <div className="leading-snug">
            <span className="font-bold text-festive-gold">
              {vendorDialogue.name} ({vendorDialogue.shop}):
            </span>{' '}
            <span className="italic text-amber-100/90 font-serif">"{vendorDialogue.greeting}"</span>
          </div>
        </div>

        {/* Catalog Grid */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 md:grid-cols-2 gap-3 my-2">
          {filteredItems.map((item) => {
            const owned = inventory[item.id] || 0;
            const canAfford = tokens >= item.price;
            const isJustPurchased = lastPurchased === item.id;

            return (
              <div
                key={item.id}
                className="bg-slate-900/60 border border-amber-500/30 hover:border-festive-gold/60 rounded-2xl p-3.5 flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <div className="text-sm font-bold text-festive-gold">{item.name}</div>
                        <div className="text-[11px] text-festive-saffron font-medium">{item.hindiName}</div>
                      </div>
                    </div>
                    {owned > 0 && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/40">
                        Owned: {owned}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-300 mt-2 leading-relaxed">{item.description}</p>
                  <p className="text-[11px] text-amber-300/80 italic mt-1 font-serif">"{item.blessing}"</p>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800">
                  <div className="flex items-center gap-1 text-sm font-mono font-bold text-festive-gold">
                    <Coins className="w-4 h-4 text-festive-amber" />
                    <span>{item.price} Tokens</span>
                  </div>

                  <button
                    onClick={() => handleBuy(item)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isJustPurchased
                        ? 'bg-emerald-600 text-white'
                        : canAfford
                        ? 'bg-gradient-to-r from-festive-gold to-festive-saffron text-amber-950 hover:brightness-110 active:scale-95'
                        : 'bg-slate-800 hover:bg-slate-700/80 text-amber-300/60 border border-slate-700 hover:border-red-500/50'
                    }`}
                  >
                    {isJustPurchased ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Purchased!</span>
                      </>
                    ) : canAfford ? (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Buy with Tokens</span>
                      </>
                    ) : (
                      <>
                        <span>Need {item.price - tokens} More</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="pt-2 text-center text-[11px] text-gray-400">
          All purchases use virtual festival tokens earned from mini-games and lighting diyas.
        </div>
      </div>
    </div>
  );
};
