import React, { useEffect, useCallback } from 'react';
import { useNpcStore } from '../../stores/useNpcStore';
import { useGameStore } from '../../stores/useGameStore';
import { soundEngine } from '../../audio/soundEngine';
import { X, Sparkles, HeartHandshake, Compass, MessageCircleHeart } from 'lucide-react';

export const VisitorDialogueModal: React.FC = () => {
  const activeVisitorDialogue = useNpcStore((s) => s.activeVisitorDialogue);
  const closeVisitorDialogue = useNpcStore((s) => s.closeVisitorDialogue);
  const activeModal = useGameStore((s) => s.activeModal);
  const reducedMotion = useGameStore((s) => s.settings.reducedMotion);

  const handleClose = useCallback(() => {
    closeVisitorDialogue();
  }, [closeVisitorDialogue]);

  const handleWarmGreeting = useCallback(() => {
    soundEngine.playVisitorGreeting();
    closeVisitorDialogue();
  }, [closeVisitorDialogue]);

  // Handle keyboard Escape and Enter
  useEffect(() => {
    if (!activeVisitorDialogue || activeModal !== 'dialogue') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeVisitorDialogue, activeModal, handleClose]);

  if (!activeVisitorDialogue || activeModal !== 'dialogue') {
    return null;
  }

  const {
    visitorName,
    role,
    personality,
    outfit,
    greeting,
    greetingHindi,
    festivalTip,
    currentActivity,
  } = activeVisitorDialogue;

  const animClass = reducedMotion ? '' : 'animate-in fade-in zoom-in-95 duration-200';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="visitor-dialogue-name"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none"
    >
      <div
        className={`relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-950 to-festive-nightBlue border-2 border-festive-gold/60 rounded-3xl shadow-2xl p-5 sm:p-6 text-white flex flex-col overflow-hidden ${animClass}`}
      >
        {/* Top Header */}
        <div className="flex items-start justify-between pb-3 border-b border-amber-500/20">
          <div className="flex items-center gap-3">
            {/* Avatar Circle with matching outfit kurta color */}
            <div
              style={{ backgroundColor: outfit.kurtaColor }}
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-md border-2 border-amber-300/60 shrink-0"
            >
              🙏
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="visitor-dialogue-name" className="text-base sm:text-lg font-bold text-festive-gold">
                  {visitorName}
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300">
                  {role}
                </span>
                <span className="text-[10px] capitalize px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {personality}
                </span>
              </div>
              <p className="text-[11px] text-amber-200/70 font-medium flex items-center gap-1 mt-0.5">
                <Compass className="w-3 h-3 text-amber-400 shrink-0" />
                <span>{currentActivity}</span>
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close conversation"
            title="Close conversation (Escape)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dialogue Body */}
        <div className="my-4 space-y-3">
          {/* Greeting Speech Card */}
          <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-3.5 shadow-inner">
            <div className="flex items-start gap-2.5">
              <MessageCircleHeart className="w-5 h-5 text-festive-gold shrink-0 mt-0.5" />
              <div>
                <p className="text-xs sm:text-sm text-amber-50 font-serif leading-relaxed">
                  "{greeting}"
                </p>
                {greetingHindi && (
                  <p className="text-[11px] sm:text-xs text-amber-300/80 mt-1.5 font-serif italic border-t border-amber-500/20 pt-1">
                    {greetingHindi}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Festival Exploration Tip */}
          <div className="bg-gradient-to-r from-amber-950/40 via-slate-900/60 to-amber-950/40 border border-amber-400/20 rounded-xl p-3 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-festive-amber shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 block mb-0.5">
                Festival Tip & Guidance
              </span>
              <p className="text-xs text-gray-200 leading-normal">
                {festivalTip}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-800">
          <span className="text-[10px] text-slate-400">
            Press [Esc] or tap button to close
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              className="py-2 px-3 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Good to see you!
            </button>
            <button
              onClick={handleWarmGreeting}
              className="py-2 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-festive-gold via-yellow-400 to-festive-amber hover:brightness-110 active:scale-95 text-slate-950 shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Shubh Deepavali! 🙏</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
