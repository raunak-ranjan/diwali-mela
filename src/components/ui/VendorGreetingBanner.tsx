import React from 'react';
import { useNpcStore } from '../../stores/useNpcStore';
import { useGameStore } from '../../stores/useGameStore';
import { X, Sparkles } from 'lucide-react';

export const VendorGreetingBanner: React.FC = () => {
  const activeGreeting = useNpcStore((s) => s.activeGreeting);
  const clearGreeting = useNpcStore((s) => s.clearGreeting);
  const activeModal = useGameStore((s) => s.activeModal);

  // Hide banner if no greeting active or if a full-screen modal/mini-game is open
  if (!activeGreeting || activeModal !== 'none') {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="vendor-greeting-banner"
      className="fixed top-16 md:top-20 left-1/2 -translate-x-1/2 z-40 max-w-lg w-[92vw] md:w-auto bg-gradient-to-r from-slate-950/95 via-amber-950/90 to-slate-950/95 border-2 border-festive-gold/60 rounded-2xl shadow-2xl p-3 md:p-4 text-white backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-festive-gold flex items-center justify-center text-amber-950 text-lg shadow-md shrink-0">
            🙏
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs md:text-sm font-bold text-festive-gold">
                {activeGreeting.vendorName}
              </span>
              <span className="text-[10px] text-amber-200/70 font-medium">
                • {activeGreeting.shopName}
              </span>
            </div>
            <p className="text-xs md:text-sm text-amber-50 mt-0.5 leading-snug font-serif">
              "{activeGreeting.text}"
            </p>
            {activeGreeting.accent && (
              <p className="text-[10px] md:text-xs text-festive-saffron mt-0.5 italic flex items-center gap-1">
                <Sparkles className="w-3 h-3 shrink-0" />
                <span>{activeGreeting.accent}</span>
              </p>
            )}
          </div>
        </div>

        <button
          onClick={clearGreeting}
          aria-label="Dismiss greeting"
          className="text-amber-200/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
