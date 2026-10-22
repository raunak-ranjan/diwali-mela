import React, { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../../stores/useGameStore';
import { Sparkles, Play, Square, Rocket, X, Minimize2, Maximize2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export const FireworksControlModal: React.FC = () => {
  const activeModal = useGameStore((s) => s.activeModal);
  const closeModal = useGameStore((s) => s.closeModal);
  const fireworksState = useGameStore((s) => s.fireworksState);
  const startScheduledFireworks = useGameStore((s) => s.startScheduledFireworks);
  const stopFireworksShow = useGameStore((s) => s.stopFireworksShow);
  const tickFireworks = useGameStore((s) => s.tickFireworks);
  const triggerManualFirework = useGameStore((s) => s.triggerManualFirework);

  const [activeTab, setActiveTab] = useState<'scheduled' | 'interactive'>('scheduled');
  const [isMinimized, setIsMinimized] = useState(false);

  const handleClose = useCallback(() => {
    stopFireworksShow();
    setIsMinimized(false);
    closeModal();
  }, [stopFireworksShow, closeModal]);

  // Scheduled show countdown & progress ticker
  useEffect(() => {
    if (fireworksState.mode !== 'scheduled') return;

    const interval = setInterval(() => {
      tickFireworks();
    }, 1000);

    return () => clearInterval(interval);
  }, [fireworksState.mode, tickFireworks]);

  // When scheduled show finishes, trigger celebratory confetti
  useEffect(() => {
    if (fireworksState.mode === 'scheduled' && fireworksState.showTimeRemaining === 1) {
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
    }
  }, [fireworksState.mode, fireworksState.showTimeRemaining]);

  // Keyboard navigation & Escape key
  useEffect(() => {
    if (activeModal !== 'fireworks' && activeModal !== 'finale') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, handleClose]);

  if (activeModal !== 'fireworks' && activeModal !== 'finale') return null;

  const isShowActive = fireworksState.mode === 'scheduled';
  const isCountingDown = isShowActive && fireworksState.countdown > 0;
  const isShowRunning = isShowActive && fireworksState.countdown === 0 && fireworksState.showTimeRemaining > 0;

  // Minimized Floating Sky-View HUD Bar
  if (isMinimized) {
    return (
      <div
        role="region"
        aria-label="Fireworks Sky Control HUD"
        data-testid="fireworks-minimized-hud"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[92vw] sm:w-auto bg-slate-950/90 border-2 border-festive-gold/80 rounded-2xl shadow-2xl p-3 text-white backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200"
      >
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎆</span>
            <div>
              <div className="text-xs font-bold text-festive-gold">
                {isShowRunning
                  ? `Grand Sky Show (${fireworksState.showTimeRemaining}s)`
                  : `Sky Launch Pad (${fireworksState.manualLaunchesCount} launched)`}
              </div>
              <div className="text-[10px] text-gray-300">Look up at the midnight sky!</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              data-testid="quick-launch-peony-btn"
              onClick={() => triggerManualFirework('peony')}
              className="py-1.5 px-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-festive-gold/40 text-amber-200 font-bold text-[11px] cursor-pointer"
            >
              🌸 Launch
            </button>
            <button
              type="button"
              data-testid="quick-launch-willow-btn"
              onClick={() => triggerManualFirework('willow')}
              className="py-1.5 px-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-festive-gold/40 text-amber-200 font-bold text-[11px] cursor-pointer"
            >
              🌾 Willow
            </button>
            <button
              type="button"
              data-testid="restore-fireworks-btn"
              onClick={() => setIsMinimized(false)}
              aria-label="Maximize controls"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white cursor-pointer"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close fireworks"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="fireworks-modal-title"
      data-testid="fireworks-control-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      <div className="relative max-w-xl w-full max-h-[92vh] bg-gradient-to-b from-slate-900 via-[#18122B] to-slate-950 border-2 border-festive-gold/70 rounded-3xl shadow-2xl p-5 md:p-6 text-white flex flex-col justify-between overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-festive-gold flex items-center justify-center text-amber-950 shadow-md shrink-0">
              <Sparkles className="w-5 h-5 text-amber-950" />
            </div>
            <div>
              <h2
                id="fireworks-modal-title"
                className="text-lg sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-festive-gold via-amber-200 to-festive-saffron"
              >
                DIWALI SKY FIREWORKS
              </h2>
              <p className="text-[11px] sm:text-xs text-amber-300/80">
                Aerial Pyrotechnics, Choreographed Show & Custom Sky Rockets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              data-testid="minimize-fireworks-btn"
              onClick={() => setIsMinimized(true)}
              aria-label="Minimize for sky view"
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-gray-300 hover:text-white cursor-pointer transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              data-testid="close-fireworks-modal-btn"
              onClick={handleClose}
              aria-label="Close fireworks panel"
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-gray-300 hover:text-white cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="grid grid-cols-2 gap-2 my-3">
          <button
            type="button"
            data-testid="tab-scheduled-fireworks"
            onClick={() => setActiveTab('scheduled')}
            className={`py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'scheduled'
                ? 'bg-gradient-to-r from-festive-gold to-festive-saffron text-amber-950 shadow-md'
                : 'bg-slate-800/80 text-gray-300 hover:bg-slate-700'
            }`}
          >
            Choreographed Grand Show
          </button>
          <button
            type="button"
            data-testid="tab-interactive-fireworks"
            onClick={() => setActiveTab('interactive')}
            className={`py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'interactive'
                ? 'bg-gradient-to-r from-festive-gold to-festive-saffron text-amber-950 shadow-md'
                : 'bg-slate-800/80 text-gray-300 hover:bg-slate-700'
            }`}
          >
            Interactive Sky Launch Pad
          </button>
        </div>

        {/* Tab 1: Scheduled Grand Show */}
        {activeTab === 'scheduled' && (
          <div className="my-2 p-4 rounded-2xl bg-gradient-to-b from-slate-900/80 to-amber-950/40 border border-amber-500/30 flex flex-col items-center text-center">
            {isCountingDown ? (
              <div className="py-4">
                <div className="text-xs uppercase text-festive-saffron font-bold mb-1 tracking-widest">
                  Grand Fireworks Countdown
                </div>
                <div className="text-6xl font-black font-mono text-festive-gold animate-bounce">
                  {fireworksState.countdown}
                </div>
                <div className="text-xs text-amber-200 mt-2">Preparing aerial mortars for launch...</div>
              </div>
            ) : isShowRunning ? (
              <div className="py-3 w-full">
                <div className="flex items-center justify-between text-xs font-bold text-festive-gold mb-2">
                  <span>🎆 Aerial Choreography in Progress</span>
                  <span>{fireworksState.showTimeRemaining}s remaining</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-amber-500/30">
                  <div
                    className="h-full bg-gradient-to-r from-festive-gold to-red-500 transition-all duration-1000"
                    style={{ width: `${((20 - fireworksState.showTimeRemaining) / 20) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-amber-100 mt-3 font-serif">
                  Multi-salvo bursts illuminating the royal mela sky!
                </p>
                <button
                  type="button"
                  data-testid="stop-fireworks-btn"
                  onClick={stopFireworksShow}
                  className="mt-4 py-2 px-6 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md mx-auto cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>Stop Show</span>
                </button>
              </div>
            ) : (
              <div className="py-2">
                <div className="text-3xl mb-1">🎇</div>
                <h3 className="text-sm font-bold text-festive-gold">Spectacular 20-Second Grand Finale Show</h3>
                <p className="text-xs text-gray-300 mt-1 max-w-sm">
                  Experience synchronized multi-salvo golden weeping willows, Saturn double-rings, and chrysanthemums.
                </p>
                <div className="flex gap-2 justify-center mt-4">
                  <button
                    type="button"
                    data-testid="start-scheduled-fireworks-btn"
                    onClick={startScheduledFireworks}
                    className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-festive-gold to-festive-saffron text-amber-950 font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-4 h-4" />
                    <span>Start Grand Finale Show</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Interactive Sky Launch Pad */}
        {activeTab === 'interactive' && (
          <div className="my-2 p-3 rounded-2xl bg-slate-900/80 border border-amber-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-festive-gold flex items-center gap-1.5">
                <Rocket className="w-3.5 h-3.5" />
                <span>Select Rocket Formation to Launch:</span>
              </span>
              <span className="text-[10px] font-mono text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/30">
                Launched: {fireworksState.manualLaunchesCount}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                data-testid="launch-peony-btn"
                onClick={() => triggerManualFirework('peony')}
                className="p-2.5 rounded-xl bg-slate-950/70 border border-amber-500/40 hover:border-festive-gold hover:bg-amber-950/30 flex items-center gap-2.5 text-left transition-all cursor-pointer active:scale-95"
              >
                <span className="text-xl">🌸</span>
                <div>
                  <div className="font-bold text-festive-gold">Classic Floral Peony</div>
                  <div className="text-[10px] text-gray-300">Spherical burst with radiant golden core</div>
                </div>
              </button>

              <button
                type="button"
                data-testid="launch-willow-btn"
                onClick={() => triggerManualFirework('willow')}
                className="p-2.5 rounded-xl bg-slate-950/70 border border-amber-500/40 hover:border-festive-gold hover:bg-amber-950/30 flex items-center gap-2.5 text-left transition-all cursor-pointer active:scale-95"
              >
                <span className="text-xl">🌾</span>
                <div>
                  <div className="font-bold text-festive-gold">Golden Weeping Willow</div>
                  <div className="text-[10px] text-gray-300">Cascading champagne streamers</div>
                </div>
              </button>

              <button
                type="button"
                data-testid="launch-ring-btn"
                onClick={() => triggerManualFirework('ring')}
                className="p-2.5 rounded-xl bg-slate-950/70 border border-amber-500/40 hover:border-festive-gold hover:bg-amber-950/30 flex items-center gap-2.5 text-left transition-all cursor-pointer active:scale-95"
              >
                <span className="text-xl">🪐</span>
                <div>
                  <div className="font-bold text-festive-gold">Saturn Double-Ring</div>
                  <div className="text-[10px] text-gray-300">Concentric tilted celestial ring formation</div>
                </div>
              </button>

              <button
                type="button"
                data-testid="launch-crackle-btn"
                onClick={() => triggerManualFirework('crackle')}
                className="p-2.5 rounded-xl bg-slate-950/70 border border-amber-500/40 hover:border-festive-gold hover:bg-amber-950/30 flex items-center gap-2.5 text-left transition-all cursor-pointer active:scale-95"
              >
                <span className="text-xl">✨</span>
                <div>
                  <div className="font-bold text-festive-gold">Chrysanthemum Crackle</div>
                  <div className="text-[10px] text-gray-300">Thunderous scintillating gold crackles</div>
                </div>
              </button>

              <button
                type="button"
                data-testid="launch-kamuro-btn"
                onClick={() => triggerManualFirework('kamuro')}
                className="p-2.5 rounded-xl bg-slate-950/70 border border-amber-500/40 hover:border-festive-gold hover:bg-amber-950/30 flex items-center gap-2.5 text-left transition-all cursor-pointer active:scale-95 sm:col-span-2"
              >
                <span className="text-xl">👑</span>
                <div>
                  <div className="font-bold text-festive-gold">Royal Kamuro Brocade Crown</div>
                  <div className="text-[10px] text-gray-300">Expansive golden canopy draping the entire horizon</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Footer info & sky minimize prompt */}
        <div className="flex items-center justify-between text-xs text-gray-400 mt-2 pt-2 border-t border-slate-800">
          <span>Tip: Minimize to watch the midnight sky while launching rockets!</span>
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="text-festive-gold font-bold hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>Sky View Mode</span>
            <Minimize2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
