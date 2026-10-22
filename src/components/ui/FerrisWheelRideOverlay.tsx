import React, { useEffect } from 'react';
import { useGameStore } from '../../stores/useGameStore';
import { Eye, LogOut } from 'lucide-react';

export const FerrisWheelRideOverlay: React.FC = () => {
  const isRiding = useGameStore((s) => s.ferrisWheelRide.isRiding);
  const rotationAngle = useGameStore((s) => s.ferrisWheelRide.rotationAngle);
  const exitFerrisWheel = useGameStore((s) => s.exitFerrisWheel);

  // Keyboard shortcut to exit ride
  useEffect(() => {
    if (!isRiding) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.code === 'KeyE') {
        exitFerrisWheel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRiding, exitFerrisWheel]);

  if (!isRiding) return null;

  // Approximate altitude above ground in meters (hub is at y=11, radius=8.5, base floor offset=1.8)
  const currentY = 11 + Math.sin(rotationAngle) * 8.5 - 1.8;
  const altitude = Math.max(1, Math.round(currentY));

  return (
    <div
      role="region"
      aria-label="Ferris Wheel Ride Controls"
      className="fixed bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-40 max-w-md w-[92vw] sm:w-auto bg-gradient-to-r from-slate-950/95 via-amber-950/90 to-slate-950/95 border-2 border-festive-gold/80 rounded-2xl shadow-2xl p-3 sm:p-4 text-white backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-festive-gold flex items-center justify-center text-amber-950 text-xl shadow-md shrink-0">
            🎡
          </div>
          <div>
            <div className="text-xs sm:text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-festive-gold to-festive-saffron">
              GIANT FERRIS WHEEL RIDE
            </div>
            <div className="text-[11px] text-amber-200/90 flex items-center gap-1.5 mt-0.5">
              <Eye className="w-3.5 h-3.5 text-festive-gold" />
              <span>Panoramic Fairground View • Altitude: ~{altitude}m</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          data-testid="ferris-wheel-exit-btn"
          onClick={exitFerrisWheel}
          className="w-full sm:w-auto py-2 px-4 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Ride [E]</span>
        </button>
      </div>
    </div>
  );
};
