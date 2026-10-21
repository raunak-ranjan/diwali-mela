import React, { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../../stores/useGameStore';
import { soundEngine } from '../../audio/soundEngine';
import { Sparkles, RotateCcw, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export const FinaleModal: React.FC = () => {
  const activeModal = useGameStore((s) => s.activeModal);
  const closeModal = useGameStore((s) => s.closeModal);
  const addTokens = useGameStore((s) => s.addTokens);
  const recordFireworksWatched = useGameStore((s) => s.recordFireworksWatched);

  const [countdown, setCountdown] = useState(2);
  const [isPlayingShow, setIsPlayingShow] = useState(false);

  const triggerShow = useCallback(() => {
    setIsPlayingShow(true);
    soundEngine.playFireworkExplosion();

    // Trigger colorful confetti shower overlay
    try {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FF5722', '#E91E63', '#00E676', '#FFBF00'],
      });
    } catch {
      // safe fallback
    }

    // Award celebration virtual tokens & increment fireworks watched statistic
    addTokens(50);
    recordFireworksWatched();
  }, [addTokens, recordFireworksWatched]);

  useEffect(() => {
    if (activeModal !== 'finale') return;

    let timer = 2;
    const interval = setInterval(() => {
      timer -= 1;
      setCountdown(timer);
      if (timer <= 0) {
        clearInterval(interval);
        triggerShow();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeModal, triggerShow]);

  const handleClose = () => {
    setIsPlayingShow(false);
    setCountdown(2);
    closeModal();
  };

  if (activeModal !== 'finale') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 animate-fadeIn pointer-events-none">
      <div className="relative max-w-lg w-full bg-gradient-to-b from-festive-nightBlue/95 via-slate-950/95 to-festive-deepNavy/95 border-2 border-festive-gold rounded-3xl shadow-2xl p-6 text-center text-white overflow-hidden pointer-events-auto backdrop-blur-md mb-2 sm:mb-0">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-gray-300 hover:text-white cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {countdown > 0 && !isPlayingShow ? (
          <div className="py-8">
            <h3 className="text-sm uppercase tracking-widest text-festive-saffron font-bold mb-2">
              Grand Diwali Fireworks Countdown
            </h3>
            <div className="text-7xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-b from-festive-gold to-festive-amber animate-ping">
              {countdown}
            </div>
            <p className="text-xs text-gray-300 mt-4">Look up into the night sky!</p>
          </div>
        ) : (
          <div className="py-4">
            <div className="text-4xl mb-2 animate-bounce">🪔 🎆 ✨ 🪔</div>

            <h2 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-festive-gold via-amber-300 to-festive-saffron font-serif tracking-wide">
              शुभ दीपावली!
            </h2>
            <h3 className="text-xl md:text-2xl font-bold text-amber-200 mt-1">
              HAPPY DIWALI!
            </h3>

            <p className="text-xs md:text-sm text-gray-200 mt-3 leading-relaxed max-w-sm mx-auto">
              May the divine light of Deepavali illuminate your path with boundless happiness, radiant health, peace, and prosperous new beginnings.
            </p>

            <div className="bg-amber-950/60 border border-festive-gold/40 rounded-2xl p-3 my-4 inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-festive-gold animate-spin" />
              <span className="text-xs font-bold text-festive-gold">
                +50 Diwali Celebration Tokens Gifted!
              </span>
            </div>

            <div className="flex gap-3 justify-center mt-3">
              <button
                onClick={triggerShow}
                className="py-2.5 px-4 rounded-xl border border-festive-gold/50 bg-slate-900 hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer text-amber-200"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Replay Fireworks</span>
              </button>
              <button
                onClick={handleClose}
                className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-festive-gold to-festive-saffron text-amber-950 font-bold text-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-lg"
              >
                Continue Exploring Mela
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
