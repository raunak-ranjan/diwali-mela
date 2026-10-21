import React, { useEffect, useState, useRef } from 'react';
import { useGameStore } from '../../../stores/useGameStore';
import { soundEngine } from '../../../audio/soundEngine';
import { Crosshair, Trophy, Sparkles, X } from 'lucide-react';

interface BalloonItem {
  id: number;
  x: number; // percentage
  y: number; // percentage
  color: string;
  isPopped: boolean;
  points: number;
}

export const BalloonShootingUI: React.FC = () => {
  const activeModal = useGameStore((s) => s.activeModal);
  const closeModal = useGameStore((s) => s.closeModal);
  const balloonGame = useGameStore((s) => s.balloonGame);
  const recordBalloonHit = useGameStore((s) => s.recordBalloonHit);
  const tickBalloonGame = useGameStore((s) => s.tickBalloonGame);

  // Crosshair tracking
  const [crosshairPos, setCrosshairPos] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate target board of 15 colorful balloons
  const [balloons, setBalloons] = useState<BalloonItem[]>(() => {
    const colors = [
      '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#ec4899',
      '#8b5cf6', '#f97316', '#06b6d4', '#84cc16', '#e11d48'
    ];
    const list: BalloonItem[] = [];
    let id = 0;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 5; c++) {
        list.push({
          id: id++,
          x: 20 + c * 15 + (Math.random() * 4 - 2),
          y: 25 + r * 22 + (Math.random() * 4 - 2),
          color: colors[(r * 5 + c) % colors.length],
          isPopped: false,
          points: (r === 0 ? 20 : r === 1 ? 15 : 10),
        });
      }
    }
    return list;
  });

  // Timer countdown
  useEffect(() => {
    if (activeModal !== 'balloon_game' || !balloonGame.isPlaying) return;

    const interval = setInterval(() => {
      tickBalloonGame();
    }, 1000);

    return () => clearInterval(interval);
  }, [activeModal, balloonGame.isPlaying, tickBalloonGame]);

  const handleShoot = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!balloonGame.isPlaying) return;

    soundEngine.playShootSound();

    // Check hit against balloons
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches[0]) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = ((clientX - rect.left) / rect.width) * 100;
    const clickY = ((clientY - rect.top) / rect.height) * 100;

    setCrosshairPos({ x: clickX, y: clickY });

    // Hit test with radius
    let hitFound = false;
    setBalloons((prev) =>
      prev.map((b) => {
        if (b.isPopped) return b;
        const dist = Math.hypot(b.x - clickX, b.y - clickY);
        if (dist < 6.5 && !hitFound) {
          hitFound = true;
          recordBalloonHit(b.points);
          return { ...b, isPopped: true };
        }
        return b;
      })
    );
  };

  if (activeModal !== 'balloon_game') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn select-none">
      <div
        ref={containerRef}
        onClick={handleShoot}
        className="relative w-full max-w-3xl h-[85vh] max-h-[600px] bg-gradient-to-b from-amber-950/60 to-slate-950 border-2 border-festive-gold/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col justify-between p-4 cursor-crosshair"
      >
        {/* Top Header HUD */}
        <div className="flex items-center justify-between w-full z-20 pointer-events-auto">
          {/* Time Remaining */}
          <div className="bg-slate-900/80 border border-amber-500/40 rounded-2xl py-1.5 px-4 flex items-center gap-2">
            <span className="text-xs uppercase font-bold text-gray-300">Time:</span>
            <span
              className={`text-xl font-black font-mono ${
                balloonGame.timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-festive-gold'
              }`}
            >
              {balloonGame.timeLeft}s
            </span>
          </div>

          {/* Title */}
          <div className="text-center flex flex-col items-center">
            <div className="text-xs sm:text-sm font-bold text-festive-gold flex items-center justify-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-festive-saffron" />
              <span>CARNIVAL BALLOON SHOOT</span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-gray-300">Tap or Click balloons to pop them!</div>
          </div>

          {/* Current Score */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-900/80 border border-amber-500/40 rounded-2xl py-1.5 px-4 flex items-center gap-2">
              <span className="text-xs uppercase font-bold text-gray-300">Score:</span>
              <span className="text-xl font-black font-mono text-festive-gold">{balloonGame.score}</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                closeModal();
              }}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-gray-300 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Target Board Play Area */}
        <div className="relative w-full h-full my-2 border border-amber-500/20 rounded-2xl bg-amber-950/20 overflow-hidden">
          {/* Wooden backboard slats effect */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Balloons */}
          {balloons.map((b) => (
            <div
              key={b.id}
              onClick={(e) => {
                e.stopPropagation();
                if (!balloonGame.isPlaying || b.isPopped) return;
                soundEngine.playShootSound();
                setBalloons((prev) =>
                  prev.map((item) => (item.id === b.id ? { ...item, isPopped: true } : item))
                );
                recordBalloonHit(b.points);
              }}
              style={{
                left: `${b.x}%`,
                top: `${b.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className={`absolute transition-transform duration-200 cursor-pointer ${
                b.isPopped ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 hover:scale-110 active:scale-95'
              }`}
            >
              <div
                style={{ backgroundColor: b.color }}
                className="w-12 h-14 rounded-full shadow-lg border border-white/30 flex items-center justify-center text-[10px] font-black text-white/90"
              >
                +{b.points}
              </div>
              <div
                style={{ borderTopColor: b.color }}
                className="w-0 h-0 border-x-4 border-x-transparent border-t-6 mx-auto -mt-0.5"
              />
            </div>
          ))}

          {/* Crosshair indicator */}
          <div
            style={{
              left: `${crosshairPos.x}%`,
              top: `${crosshairPos.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            className="absolute pointer-events-none w-8 h-8 border-2 border-festive-gold rounded-full flex items-center justify-center shadow-lg shadow-amber-500/50"
          >
            <div className="w-1.5 h-1.5 bg-festive-gold rounded-full" />
          </div>
        </div>

        {/* Completion Modal when timer runs out */}
        {!balloonGame.isPlaying && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30 animate-fadeIn">
            <Trophy className="w-16 h-16 text-festive-gold mb-3 animate-bounce" />
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-festive-gold to-festive-saffron">
              BOOTH COMPLETED!
            </h2>
            <p className="text-gray-300 mt-1 text-sm">Shabash! Great aiming at the carnival.</p>

            <div className="bg-slate-900/80 border border-amber-500/40 rounded-2xl p-4 my-4 w-64">
              <div className="text-xs uppercase text-gray-400">Final Score</div>
              <div className="text-3xl font-black text-festive-gold font-mono">{balloonGame.score}</div>
              <div className="text-xs text-festive-saffron mt-2 font-bold flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>+ {Math.max(10, Math.floor(balloonGame.score / 2))} Virtual Tokens Earned!</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeModal();
                }}
                className="py-2.5 px-6 rounded-xl font-bold text-amber-950 bg-gradient-to-r from-festive-gold to-festive-saffron hover:brightness-110 active:scale-95 transition-all shadow-lg cursor-pointer"
              >
                COLLECT REWARD & RETURN
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
