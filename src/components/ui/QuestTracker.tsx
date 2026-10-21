import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../stores/useGameStore';
import { MAGICAL_DIYAS_CONFIG } from '../../types/quest';
import { Sparkles, ChevronDown, ChevronUp, CheckCircle2, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export const QuestTracker: React.FC = () => {
  const quest = useGameStore((s) => s.quest);
  const questNotification = useGameStore((s) => s.questNotification);
  const dismissQuestNotification = useGameStore((s) => s.dismissQuestNotification);
  const activeModal = useGameStore((s) => s.activeModal);
  const reducedMotion = useGameStore((s) => s.settings.reducedMotion);

  const [isMinimized, setIsMinimized] = useState(false);

  // Auto-dismiss quest notification after 4 seconds
  useEffect(() => {
    if (!questNotification) return;

    if (questNotification.type === 'completed' && !reducedMotion) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.25 },
          colors: ['#FFD700', '#FFA000', '#FF5722', '#00E676'],
        });
      } catch {
        // safe fallback
      }
    }

    const timer = setTimeout(() => {
      dismissQuestNotification();
    }, 8000);

    return () => clearTimeout(timer);
  }, [questNotification, dismissQuestNotification, reducedMotion]);

  if (activeModal !== 'none') return null;

  const collectedCount = quest.collectedDiyas.length;
  const isAllCollected = quest.isCompleted || collectedCount >= quest.targetCount;

  // Find next uncollected Diya hint
  const nextDiya = MAGICAL_DIYAS_CONFIG.find((d) => !quest.collectedDiyas.includes(d.id));

  return (
    <>
      {/* Toast Notification Banner (Top-Center) */}
      {questNotification && (
        <div className="fixed top-16 inset-x-0 pointer-events-none z-50 flex justify-center px-4 animate-slideDown">
          <div
            className={`pointer-events-auto flex items-center gap-3 px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md border ${
              questNotification.type === 'completed'
                ? 'bg-gradient-to-r from-amber-950/95 via-yellow-900/90 to-amber-950/95 border-festive-gold text-white shadow-amber-500/30'
                : 'bg-slate-900/95 border-amber-500/50 text-white shadow-amber-500/20'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center shrink-0 shadow-md">
              {questNotification.type === 'completed' ? (
                <CheckCircle2 className="w-5 h-5 text-amber-950 font-bold" />
              ) : (
                <Sparkles className="w-4 h-4 text-amber-950 font-bold" />
              )}
            </div>

            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-festive-gold">{questNotification.title}</span>
              <span className="text-xs text-gray-200">{questNotification.message}</span>
            </div>

            <button
              onClick={dismissQuestNotification}
              className="text-gray-400 hover:text-white p-1 ml-2 transition-colors cursor-pointer"
              aria-label="Dismiss Notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Quest Tracker Card (Top-Left under Tokens Counter) */}
      <div className="pointer-events-auto mt-2 max-w-[270px] sm:max-w-[310px]">
        <div
          className={`backdrop-blur-md rounded-2xl border transition-all duration-300 shadow-xl overflow-hidden ${
            isAllCollected
              ? 'bg-slate-900/90 border-festive-gold/60 shadow-amber-500/20'
              : 'bg-slate-900/80 border-amber-500/30 shadow-black/40'
          }`}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-3.5 py-2 bg-slate-950/40 border-b border-amber-500/20">
            <div className="flex items-center gap-1.5">
              <span className="text-base select-none">🪔</span>
              <span className="text-xs font-bold text-festive-gold tracking-wide">
                {quest.title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-amber-300/90 bg-amber-950/60 border border-amber-500/40 rounded-full px-2 py-0.5">
                Reward: Bonus 🪙
              </span>
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-gray-400 hover:text-white p-0.5 transition-colors cursor-pointer"
                aria-label={isMinimized ? 'Expand Quest Tracker' : 'Minimize Quest Tracker'}
                title={isMinimized ? 'Expand Quest Tracker' : 'Minimize Quest Tracker'}
              >
                {isMinimized ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Body Content */}
          {!isMinimized && (
            <div className="p-3 text-left">
              {/* Progress Count & Status */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-200">
                  {isAllCollected ? 'All 5 Diyas Kindled!' : 'Kindle Sacred Diyas'}
                </span>
                <span
                  className={`text-xs font-mono font-bold ${
                    isAllCollected ? 'text-emerald-400' : 'text-festive-gold'
                  }`}
                >
                  {collectedCount} / {quest.targetCount}
                </span>
              </div>

              {/* 5 Diya Beads / Pips */}
              <div className="grid grid-cols-5 gap-1.5 mb-2.5">
                {MAGICAL_DIYAS_CONFIG.map((d) => {
                  const isFound = quest.collectedDiyas.includes(d.id);
                  return (
                    <div
                      key={d.id}
                      title={`${d.name} (${d.zoneHint})`}
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        isFound
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-300 shadow-sm shadow-amber-400/50'
                          : 'bg-slate-800 border border-slate-700'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Next Hint or Completion Message */}
              {isAllCollected ? (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 rounded-lg px-2.5 py-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Blessing of Light unlocked! Bonus tokens awarded.</span>
                </div>
              ) : (
                nextDiya && (
                  <div className="text-[11px] text-amber-200/80 bg-amber-950/30 border border-amber-500/20 rounded-lg px-2 py-1">
                    <span className="font-semibold text-amber-400">Next Hint: </span>
                    <span>{nextDiya.zoneHint}</span>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
