import React, { useEffect, useState } from 'react';
import { useGameStore, MAX_RING_TOSS_RINGS, calculateRingTossReward } from '../../../stores/useGameStore';
import { CircleDot, Trophy, X, Target } from 'lucide-react';

interface RingTarget {
  id: number;
  tier: 'front' | 'middle' | 'back';
  name: string;
  hindiName: string;
  points: number;
  icon: string;
  color: string;
}

const TARGETS: readonly RingTarget[] = [
  // Front Row (10 pts)
  { id: 1, tier: 'front', name: 'Brass Diya Bottle 1', hindiName: 'पीतल दीया', points: 10, icon: '🪔', color: '#f59e0b' },
  { id: 2, tier: 'front', name: 'Brass Diya Bottle 2', hindiName: 'पीतल दीया', points: 10, icon: '🪔', color: '#f59e0b' },
  { id: 3, tier: 'front', name: 'Brass Diya Bottle 3', hindiName: 'पीतल दीया', points: 10, icon: '🪔', color: '#f59e0b' },
  { id: 4, tier: 'front', name: 'Brass Diya Bottle 4', hindiName: 'पीतल दीया', points: 10, icon: '🪔', color: '#f59e0b' },

  // Middle Row (15 pts)
  { id: 5, tier: 'middle', name: 'Painted Terracotta Pot 1', hindiName: 'मिट्टी मटका', points: 15, icon: '🏺', color: '#ea580c' },
  { id: 6, tier: 'middle', name: 'Painted Terracotta Pot 2', hindiName: 'मिट्टी मटका', points: 15, icon: '🏺', color: '#ea580c' },
  { id: 7, tier: 'middle', name: 'Painted Terracotta Pot 3', hindiName: 'मिट्टी मटका', points: 15, icon: '🏺', color: '#ea580c' },

  // Back Row (25 pts)
  { id: 8, tier: 'back', name: 'Royal Golden Kalash 1', hindiName: 'स्वर्ण कलश', points: 25, icon: '👑', color: '#ffd700' },
  { id: 9, tier: 'back', name: 'Royal Golden Kalash 2', hindiName: 'स्वर्ण कलश', points: 25, icon: '👑', color: '#ffd700' },
];

export const RingTossUI: React.FC = () => {
  const activeModal = useGameStore((s) => s.activeModal);
  const closeModal = useGameStore((s) => s.closeModal);
  const ringTossGame = useGameStore((s) => s.ringTossGame);
  const startRingTossGame = useGameStore((s) => s.startRingTossGame);
  const recordRingTossThrow = useGameStore((s) => s.recordRingTossThrow);
  const tickRingTossGame = useGameStore((s) => s.tickRingTossGame);
  const cancelRingTossGame = useGameStore((s) => s.cancelRingTossGame);
  const reducedMotion = useGameStore((s) => s.settings.reducedMotion);

  // Phase derived purely from authoritative game store state
  const phase: 'ready' | 'playing' | 'finished' =
    ringTossGame.isPlaying
      ? 'playing'
      : ringTossGame.ringsRemaining === 0
      ? 'finished'
      : 'ready';

  const [landedTargets, setLandedTargets] = useState<number[]>([]);
  const [lastThrowResult, setLastThrowResult] = useState<{ targetId: number | null; points: number; isHit: boolean } | null>(null);
  const [isThrowing, setIsThrowing] = useState<boolean>(false);

  // Timer countdown
  useEffect(() => {
    if (activeModal !== 'ring_toss' || !ringTossGame.isPlaying || phase !== 'playing') return;

    const interval = setInterval(() => {
      tickRingTossGame();
    }, 1000);

    return () => clearInterval(interval);
  }, [activeModal, ringTossGame.isPlaying, phase, tickRingTossGame]);

  // Keyboard navigation & Escape key handling
  useEffect(() => {
    if (activeModal !== 'ring_toss') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (phase === 'playing') {
          cancelRingTossGame();
        } else {
          closeModal();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, phase, cancelRingTossGame, closeModal]);

  if (activeModal !== 'ring_toss') return null;

  const handleStartRound = () => {
    setLandedTargets([]);
    setLastThrowResult(null);
    setIsThrowing(false);
    startRingTossGame();
  };

  const handleThrow = (target: RingTarget | null) => {
    if (!ringTossGame.isPlaying || ringTossGame.ringsRemaining <= 0 || isThrowing) return;

    setIsThrowing(true);
    const isHit = target !== null;
    const points = target ? target.points : 0;

    if (target) {
      setLandedTargets((prev) => [...prev, target.id]);
    }
    setLastThrowResult({ targetId: target ? target.id : null, points, isHit });

    const delay = reducedMotion ? 50 : 250;
    setTimeout(() => {
      recordRingTossThrow(points, isHit);
      setIsThrowing(false);
    }, delay);
  };

  const rewardTokens = calculateRingTossReward(ringTossGame.score);
  const accuracy = MAX_RING_TOSS_RINGS > 0
    ? Math.round((ringTossGame.hitsCount / MAX_RING_TOSS_RINGS) * 100)
    : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ringtoss-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 select-none animate-in fade-in duration-200"
    >
      <div className="relative max-w-2xl w-full max-h-[92vh] bg-gradient-to-b from-slate-900 via-[#19152b] to-slate-950 border-2 border-festive-gold/60 rounded-3xl shadow-2xl p-4 sm:p-6 text-white flex flex-col justify-between overflow-hidden">

        {/* ============================================================
            HEADER BAR
           ============================================================ */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-festive-gold flex items-center justify-center text-amber-950 shadow-md shrink-0">
              <CircleDot className="w-5 h-5 text-amber-950" />
            </div>
            <div>
              <h2
                id="ringtoss-title"
                className="text-base sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-festive-gold via-amber-200 to-festive-saffron"
              >
                DIWALI RING TOSS
              </h2>
              <p className="text-[10px] sm:text-xs text-amber-300/80 font-medium">
                रिंग टॉस मेला • Carnival Skill Attraction
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {phase === 'playing' && (
              <div className="flex items-center gap-1.5 bg-amber-500/10 border border-festive-gold/40 rounded-full py-1 px-3 text-xs font-mono font-bold text-festive-gold">
                <span className="text-[10px] uppercase text-amber-300/80 font-sans">Time:</span>
                <span className={ringTossGame.timeLeft <= 5 ? 'text-red-400 animate-pulse' : ''}>
                  {ringTossGame.timeLeft}s
                </span>
              </div>
            )}
            <button
              onClick={() => {
                if (phase === 'playing') {
                  cancelRingTossGame();
                } else {
                  closeModal();
                }
              }}
              aria-label="Close Ring Toss Modal"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-festive-gold"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ============================================================
            PHASE 1: READY / INSTRUCTIONS VIEW
           ============================================================ */}
        {phase === 'ready' && (
          <div className="my-auto py-4 flex flex-col items-center text-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-festive-saffron flex items-center justify-center text-amber-950 shadow-xl mb-3">
              <Target className="w-9 h-9" />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-festive-gold mb-2">
              Toss Rings & Win Fair Tokens!
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-4">
              Test your festival aim! Toss rings onto festive bottle targets. Land rings around bottle pegs to earn points and win fair tokens!
            </p>

            {/* Rules and Rewards Grid */}
            <div className="grid grid-cols-3 gap-2 w-full my-2 text-xs">
              <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-2.5 flex flex-col items-center">
                <span className="text-xl mb-1">🪔</span>
                <span className="font-bold text-amber-300">Front Row</span>
                <span className="text-[11px] text-festive-gold font-mono font-bold">+10 pts</span>
              </div>
              <div className="bg-slate-900/80 border border-orange-500/30 rounded-2xl p-2.5 flex flex-col items-center">
                <span className="text-xl mb-1">🏺</span>
                <span className="font-bold text-orange-300">Middle Row</span>
                <span className="text-[11px] text-festive-gold font-mono font-bold">+15 pts</span>
              </div>
              <div className="bg-slate-900/80 border border-yellow-500/30 rounded-2xl p-2.5 flex flex-col items-center">
                <span className="text-xl mb-1">👑</span>
                <span className="font-bold text-yellow-300">Back Kalash</span>
                <span className="text-[11px] text-festive-gold font-mono font-bold">+25 pts</span>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-festive-gold/30 rounded-xl py-2 px-4 my-3 text-[11px] sm:text-xs text-amber-200 text-center font-medium">
              5 Rings • 30-Second Limit • Up to 25 🪙 Fair Tokens Reward
            </div>

            <div className="flex gap-3 mt-2 w-full sm:w-auto">
              <button
                onClick={closeModal}
                className="flex-1 sm:flex-initial py-2.5 px-6 rounded-full text-xs font-bold bg-slate-800 hover:bg-slate-700 text-gray-300 transition-all cursor-pointer"
              >
                Back to Mela
              </button>
              <button
                onClick={handleStartRound}
                data-testid="start-ring-toss-btn"
                className="flex-1 sm:flex-initial py-2.5 px-8 rounded-full text-xs font-black bg-gradient-to-r from-festive-gold to-festive-saffron text-amber-950 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-festive-gold"
              >
                Start Toss! 🎯
              </button>
            </div>
          </div>
        )}

        {/* ============================================================
            PHASE 2: PLAYING VIEW (INTERACTIVE THROW ARENA)
           ============================================================ */}
        {phase === 'playing' && (
          <div className="flex-1 flex flex-col justify-between my-2">
            {/* Live Status Bar */}
            <div className="flex items-center justify-between bg-slate-900/80 border border-amber-500/30 rounded-2xl py-2 px-3.5 mb-2 text-xs">
              {/* Rings Rack */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] uppercase font-bold text-gray-400 mr-1 hidden sm:inline">Rings:</span>
                {Array.from({ length: MAX_RING_TOSS_RINGS }).map((_, i) => (
                  <div
                    key={i}
                    aria-hidden="true"
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      i < ringTossGame.ringsRemaining
                        ? 'border-festive-gold bg-amber-500/20 shadow-md shadow-amber-500/20 text-yellow-300'
                        : 'border-slate-700 bg-slate-900 text-slate-600 opacity-40'
                    }`}
                  >
                    <span className="text-[10px]">⭕</span>
                  </div>
                ))}
                <span className="ml-1 text-xs font-mono font-bold text-festive-gold sm:hidden">
                  x{ringTossGame.ringsRemaining}
                </span>
              </div>

              {/* Current Score */}
              <div className="flex items-center gap-3 font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] uppercase font-sans text-gray-400">Score:</span>
                  <span className="text-base sm:text-lg font-black text-festive-gold">
                    {ringTossGame.score}
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-gray-400 text-[11px] font-sans">
                  <span>Best:</span>
                  <span className="font-mono text-amber-300 font-bold">{ringTossGame.highScore}</span>
                </div>
              </div>
            </div>

            {/* Target Field Arena */}
            <div className="relative flex-1 bg-gradient-to-b from-slate-950 via-[#18152c] to-slate-950 border border-amber-500/30 rounded-3xl p-3 flex flex-col justify-between overflow-hidden">

              {/* Throw feedback message */}
              <div className="text-center min-h-[20px]">
                {lastThrowResult ? (
                  <span
                    className={`text-xs font-bold animate-in zoom-in-90 duration-150 ${
                      lastThrowResult.isHit ? 'text-festive-gold' : 'text-slate-400'
                    }`}
                  >
                    {lastThrowResult.isHit
                      ? `✨ Ring Landed! +${lastThrowResult.points} Points!`
                      : '💨 Miss! Toss aimed wide.'}
                  </span>
                ) : (
                  <span className="text-xs text-amber-300/70 font-medium">
                    Tap a bottle or peg to throw a golden ring!
                  </span>
                )}
              </div>

              {/* Tier 3 (Back Row: 2 Royal Kalash - 25 pts) */}
              <div className="flex justify-center gap-6 sm:gap-12 my-1">
                {TARGETS.filter((t) => t.tier === 'back').map((target) => {
                  const hasRing = landedTargets.includes(target.id);
                  return (
                    <button
                      key={target.id}
                      onClick={() => handleThrow(target)}
                      disabled={isThrowing || ringTossGame.ringsRemaining <= 0}
                      data-testid={`ring-target-${target.id}`}
                      aria-label={`Toss ring at ${target.name} for ${target.points} points`}
                      className={`group relative p-2 sm:p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center focus:outline-none focus:ring-2 focus:ring-festive-gold ${
                        hasRing
                          ? 'bg-yellow-500/20 border-yellow-400 shadow-lg shadow-yellow-500/20 scale-105'
                          : 'bg-slate-900/60 border-yellow-500/40 hover:border-festive-gold hover:scale-105 active:scale-95'
                      }`}
                    >
                      <span className="text-2xl sm:text-3xl mb-0.5 filter drop-shadow">{target.icon}</span>
                      <span className="text-[10px] font-bold text-yellow-300">{target.hindiName}</span>
                      <span className="text-[10px] font-mono font-bold text-festive-gold">+{target.points}</span>
                      {hasRing && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-festive-gold text-amber-950 text-[10px] font-black flex items-center justify-center shadow">
                          ✓
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Tier 2 (Middle Row: 3 Terracotta Pots - 15 pts) */}
              <div className="flex justify-center gap-4 sm:gap-8 my-1">
                {TARGETS.filter((t) => t.tier === 'middle').map((target) => {
                  const hasRing = landedTargets.includes(target.id);
                  return (
                    <button
                      key={target.id}
                      onClick={() => handleThrow(target)}
                      disabled={isThrowing || ringTossGame.ringsRemaining <= 0}
                      data-testid={`ring-target-${target.id}`}
                      aria-label={`Toss ring at ${target.name} for ${target.points} points`}
                      className={`group relative p-2 sm:p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center focus:outline-none focus:ring-2 focus:ring-festive-gold ${
                        hasRing
                          ? 'bg-orange-500/20 border-orange-400 shadow-lg shadow-orange-500/20 scale-105'
                          : 'bg-slate-900/60 border-orange-500/40 hover:border-festive-gold hover:scale-105 active:scale-95'
                      }`}
                    >
                      <span className="text-2xl sm:text-3xl mb-0.5 filter drop-shadow">{target.icon}</span>
                      <span className="text-[10px] font-bold text-orange-300">{target.hindiName}</span>
                      <span className="text-[10px] font-mono font-bold text-festive-gold">+{target.points}</span>
                      {hasRing && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-festive-gold text-amber-950 text-[10px] font-black flex items-center justify-center shadow">
                          ✓
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Tier 1 (Front Row: 4 Brass Diyas - 10 pts) */}
              <div className="flex justify-center gap-3 sm:gap-6 my-1">
                {TARGETS.filter((t) => t.tier === 'front').map((target) => {
                  const hasRing = landedTargets.includes(target.id);
                  return (
                    <button
                      key={target.id}
                      onClick={() => handleThrow(target)}
                      disabled={isThrowing || ringTossGame.ringsRemaining <= 0}
                      data-testid={`ring-target-${target.id}`}
                      aria-label={`Toss ring at ${target.name} for ${target.points} points`}
                      className={`group relative p-1.5 sm:p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center focus:outline-none focus:ring-2 focus:ring-festive-gold ${
                        hasRing
                          ? 'bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/20 scale-105'
                          : 'bg-slate-900/60 border-amber-500/40 hover:border-festive-gold hover:scale-105 active:scale-95'
                      }`}
                    >
                      <span className="text-2xl sm:text-3xl mb-0.5 filter drop-shadow">{target.icon}</span>
                      <span className="text-[10px] font-bold text-amber-300">{target.hindiName}</span>
                      <span className="text-[10px] font-mono font-bold text-festive-gold">+{target.points}</span>
                      {hasRing && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-festive-gold text-amber-950 text-[10px] font-black flex items-center justify-center shadow">
                          ✓
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Miss throw trigger (open board area) */}
              <div className="flex justify-center pt-2">
                <button
                  onClick={() => handleThrow(null)}
                  disabled={isThrowing || ringTossGame.ringsRemaining <= 0}
                  data-testid="ring-toss-miss-area"
                  aria-label="Toss ring into stall open space"
                  className="py-1 px-4 text-[10px] text-slate-400 hover:text-slate-200 bg-slate-900/40 hover:bg-slate-800 border border-slate-700/60 rounded-full transition-all cursor-pointer"
                >
                  Toss Wide (Miss Arena)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            PHASE 3: FINISHED / RESULTS SUMMARY VIEW
           ============================================================ */}
        {phase === 'finished' && (
          <div className="my-auto py-4 flex flex-col items-center text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-festive-gold flex items-center justify-center text-amber-950 shadow-2xl mb-3">
              <Trophy className="w-9 h-9" />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-festive-gold mb-1">
              Round Complete!
            </h3>
            <p className="text-xs text-amber-300/80 font-medium mb-4">
              Carnival Ring Toss Results
            </p>

            {/* Score & Reward Card */}
            <div className="w-full bg-slate-900/90 border-2 border-festive-gold/50 rounded-2xl p-4 my-2 flex flex-col gap-2.5">
              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800">
                <span className="text-gray-300">Final Score:</span>
                <span data-testid="ring-toss-final-score" className="font-mono text-base font-black text-festive-gold">
                  {ringTossGame.score} pts
                </span>
              </div>
              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800">
                <span className="text-gray-300">Rings Landed:</span>
                <span className="font-mono font-bold text-white">
                  {ringTossGame.hitsCount} / {MAX_RING_TOSS_RINGS} ({accuracy}%)
                </span>
              </div>
              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800">
                <span className="text-gray-300">High Score:</span>
                <span data-testid="ring-toss-high-score" className="font-mono font-bold text-amber-300">
                  {ringTossGame.highScore} pts
                </span>
              </div>
              <div className="flex justify-between items-center text-sm pt-1">
                <span className="font-bold text-festive-saffron">Tokens Earned:</span>
                <span data-testid="ring-toss-reward-tokens" className="font-mono text-lg font-black text-festive-gold flex items-center gap-1">
                  +{rewardTokens} 🪙
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-4 w-full">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 px-4 rounded-full text-xs font-bold bg-slate-800 hover:bg-slate-700 text-gray-300 transition-all cursor-pointer"
              >
                Leave Stall
              </button>
              <button
                onClick={handleStartRound}
                data-testid="play-again-ring-toss-btn"
                className="flex-1 py-2.5 px-6 rounded-full text-xs font-black bg-gradient-to-r from-festive-gold to-festive-saffron text-amber-950 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-festive-gold"
              >
                Play Again 🎯
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
