import React, { useState, useEffect } from 'react';
import { useGameStore, SHOP_CATALOG } from '../../stores/useGameStore';
import { ShoppingBag, X, Sparkles, Flame, Cookie, Info, AlertCircle } from 'lucide-react';

export const FestivalPouchModal: React.FC = () => {
  const activeModal = useGameStore((s) => s.activeModal);
  const closeModal = useGameStore((s) => s.closeModal);
  const inventory = useGameStore((s) => s.inventory);
  const sparklerActiveUntil = useGameStore((s) => s.sparklerActiveUntil);
  const consumeInventoryItem = useGameStore((s) => s.consumeInventoryItem);
  const lightSparkler = useGameStore((s) => s.lightSparkler);
  const offerDiyaToShrine = useGameStore((s) => s.offerDiyaToShrine);

  const [activeCategory, setActiveCategory] = useState<'all' | 'sweet' | 'diya' | 'handicraft'>('all');
  const [feedback, setFeedback] = useState<{ message: string; isError?: boolean } | null>(null);
  const [inspectingKeepsake, setInspectingKeepsake] = useState(false);

  // Auto-dismiss toast feedback (6 seconds for comfortable reading)
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => {
      setFeedback(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [feedback]);

  // Keyboard navigation & Escape key listener
  useEffect(() => {
    if (activeModal !== 'inventory') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (inspectingKeepsake) {
          setInspectingKeepsake(false);
        } else {
          closeModal();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, inspectingKeepsake, closeModal]);

  if (activeModal !== 'inventory') return null;

  const isSparklerActive = Boolean(sparklerActiveUntil);

  // Total items calculation (treating legacy earthen_diya and clay_diyas_set seamlessly)
  const totalItemsCount = Object.values(inventory).reduce(
    (acc, val) => acc + (typeof val === 'number' && val > 0 ? val : 0),
    0
  );

  const filteredItems = SHOP_CATALOG.filter((item) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'sweet') return item.category === 'sweet' || item.category === 'snack';
    if (activeCategory === 'diya') return item.category === 'diya' || item.category === 'sparkler';
    return item.category === 'handicraft';
  });

  const getOwnedCount = (itemId: string): number => {
    if (itemId === 'clay_diyas_set') {
      return (inventory['clay_diyas_set'] || 0) + (inventory['earthen_diya'] || 0);
    }
    return inventory[itemId] || 0;
  };

  const handleEatSweet = (itemId: string) => {
    const result = consumeInventoryItem(itemId);
    setFeedback({ message: result.message, isError: !result.success });
  };

  const handleLightSparkler = () => {
    const result = lightSparkler();
    setFeedback({ message: result.message, isError: !result.success });
  };

  const handleOfferDiya = () => {
    const result = offerDiyaToShrine();
    setFeedback({ message: result.message, isError: !result.success });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pouch-modal-title"
      aria-describedby="pouch-modal-desc"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="relative max-w-2xl w-full max-h-[92vh] bg-gradient-to-b from-slate-900 via-[#121324] to-slate-950 border-2 border-festive-gold/60 rounded-3xl shadow-2xl p-4 sm:p-6 text-white flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-festive-gold flex items-center justify-center text-amber-950 shadow-md shrink-0">
              <ShoppingBag className="w-5 h-5 text-amber-950" />
            </div>
            <div>
              <h2
                id="pouch-modal-title"
                className="text-lg sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-festive-gold via-amber-200 to-festive-saffron"
              >
                FESTIVAL POUCH & INVENTORY
              </h2>
              <p id="pouch-modal-desc" className="text-[11px] sm:text-xs text-amber-300/80">
                Sweets, Sacred Diyas, Sparklers & Mela Keepsakes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-festive-gold/50 rounded-full py-1 px-3 text-xs font-mono">
              <span className="text-[10px] uppercase text-amber-300 font-bold hidden xs:inline">Total:</span>
              <span className="font-black text-festive-gold">{totalItemsCount}</span>
            </div>
            <button
              onClick={closeModal}
              aria-label="Close modal"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-festive-gold"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {feedback && (
          <div
            role="status"
            className={`my-2 p-2.5 rounded-xl border text-xs sm:text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 ${
              feedback.isError
                ? 'bg-rose-950/80 border-rose-500/60 text-rose-200'
                : 'bg-amber-950/80 border-amber-500/60 text-amber-200 shadow-md shadow-amber-500/10'
            }`}
          >
            {feedback.isError ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-festive-gold shrink-0" />
            )}
            <span className="flex-1">{feedback.message}</span>
            <button
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-white p-0.5 text-xs"
              aria-label="Dismiss feedback"
            >
              ✕
            </button>
          </div>
        )}

        {/* Categories Tab Navigation */}
        <div className="flex gap-2 my-2.5 overflow-x-auto pb-1 text-xs whitespace-nowrap">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'sweet', label: 'Mithai & Sweets 🍯' },
            { id: 'diya', label: 'Diyas & Sparklers 🪔' },
            { id: 'handicraft', label: 'Keepsakes 🏮' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`py-1.5 px-3.5 rounded-full font-bold transition-all shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-festive-gold/60 ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-festive-gold to-festive-saffron text-amber-950 shadow-md'
                  : 'bg-slate-800/80 text-gray-300 hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Inventory Cards Grid */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 md:grid-cols-2 gap-3 my-1">
          {filteredItems.map((item) => {
            const owned = getOwnedCount(item.id);

            return (
              <div
                key={item.id}
                className={`border rounded-2xl p-3.5 flex flex-col justify-between transition-all ${
                  owned > 0
                    ? 'bg-slate-900/70 border-amber-500/40 hover:border-festive-gold/70'
                    : 'bg-slate-950/40 border-slate-800 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl shrink-0">{item.icon}</span>
                      <div>
                        <div className="text-sm font-bold text-festive-gold">{item.name}</div>
                        <div className="text-[11px] text-festive-saffron font-medium">{item.hindiName}</div>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        owned > 0
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-800 text-slate-500 border-slate-700'
                      }`}
                    >
                      {owned > 0 ? `Owned: ${owned}` : 'Out of Stock'}
                    </span>
                  </div>

                  <p className="text-xs text-gray-300 mt-2 leading-relaxed">{item.description}</p>
                  <p className="text-[11px] text-amber-300/80 italic mt-1 font-serif">"{item.blessing}"</p>
                </div>

                {/* Contextual Action Button */}
                <div className="mt-3.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 capitalize">
                    {item.category === 'sweet' ? 'Consumable Mithai' : item.category === 'snack' ? 'Savory Snack' : item.category === 'sparkler' ? 'Pyrotechnic' : item.category === 'diya' ? 'Sacred Offering' : 'Festival Keepsake'}
                  </span>

                  {(item.category === 'sweet' || item.category === 'snack') && (
                    <button
                      onClick={() => handleEatSweet(item.id)}
                      disabled={owned <= 0}
                      aria-label={`Eat ${item.name}`}
                      className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-festive-gold ${
                        owned > 0
                          ? 'bg-gradient-to-r from-amber-600 to-festive-gold text-amber-950 hover:brightness-110 active:scale-95 shadow-md shadow-amber-500/10'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Cookie className="w-3.5 h-3.5" />
                      <span>{owned > 0 ? (item.category === 'snack' ? 'Enjoy Snack' : 'Eat Sweet') : 'Out of Stock'}</span>
                    </button>
                  )}

                  {item.category === 'sparkler' && (
                    <button
                      onClick={handleLightSparkler}
                      disabled={owned <= 0 || isSparklerActive}
                      aria-label={`Light ${item.name}`}
                      className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-festive-gold ${
                        isSparklerActive
                          ? 'bg-amber-500/20 text-yellow-300 border border-amber-400/50 cursor-default'
                          : owned > 0
                          ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-amber-950 hover:brightness-110 active:scale-95 shadow-md shadow-yellow-500/20'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isSparklerActive ? 'animate-spin' : ''}`} />
                      <span>{isSparklerActive ? 'Sparkling... ✨' : owned > 0 ? 'Light Sparkler' : 'Out of Stock'}</span>
                    </button>
                  )}

                  {item.category === 'diya' && (
                    <button
                      onClick={handleOfferDiya}
                      disabled={owned <= 0}
                      aria-label={`Offer ${item.name} at shrine`}
                      className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-festive-gold ${
                        owned > 0
                          ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white hover:brightness-110 active:scale-95 shadow-md shadow-orange-500/10'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span>{owned > 0 ? 'Offer at Shrine' : 'Out of Stock'}</span>
                    </button>
                  )}

                  {item.category === 'handicraft' && (
                    <button
                      onClick={() => setInspectingKeepsake(true)}
                      aria-label={`Inspect ${item.name}`}
                      className="py-1.5 px-3.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 hover:border-festive-gold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-festive-gold"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>Inspect Keepsake</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Keepsake Inspection Lore Modal Dialog */}
        {inspectingKeepsake && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="keepsake-details-title"
            className="absolute inset-0 z-10 bg-slate-950/95 p-6 rounded-3xl flex flex-col justify-between animate-in zoom-in-95 duration-200 border-2 border-festive-gold"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-amber-500/30">
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl">🏮</span>
                  <div>
                    <h3 id="keepsake-details-title" className="text-lg font-black text-festive-gold">
                      Akash Kandil Festival Lantern
                    </h3>
                    <span className="text-xs text-festive-saffron font-medium">आकाश कंदील • Festival Keepsake</span>
                  </div>
                </div>
                <button
                  onClick={() => setInspectingKeepsake(false)}
                  aria-label="Close keepsake details"
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs sm:text-sm text-gray-200 leading-relaxed">
                <p>
                  The <strong className="text-amber-300">Akash Kandil</strong> (Sky Lantern) is an auspicious geometric star lantern hung outside doorways during Kartik month.
                </p>
                <p>
                  According to Diwali folklore, these luminous lanterns originated to guide the righteous path of Bhagwan Shri Rama back to Ayodhya, and to invite Goddess Lakshmi's benevolent grace into welcoming homes.
                </p>
                <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl text-amber-200 italic font-serif text-xs">
                  "May beacon lights guide auspicious fortune, health, and peace to your doorstep throughout the festive season!"
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setInspectingKeepsake(false)}
                className="py-2 px-5 rounded-full text-xs font-bold bg-gradient-to-r from-amber-600 to-festive-gold text-amber-950 hover:brightness-110 active:scale-95 shadow-md cursor-pointer"
              >
                Back to Pouch
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
