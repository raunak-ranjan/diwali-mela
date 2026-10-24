import React, { useEffect } from 'react';
import { useGameStore } from '../../stores/useGameStore';
import { SANGEET_VIDEO_CONFIG } from '../../utils/attractionConfig';
import { Tv, ExternalLink, X } from 'lucide-react';

export const StageScreenOverlay: React.FC = () => {
  const isScreenActive = useGameStore((s) => s.culturalStageState.isScreenActive);
  const setStageScreenActive = useGameStore((s) => s.setStageScreenActive);

  // Keyboard shortcut: Escape exits the in-world stage screen playback cleanly
  useEffect(() => {
    if (!isScreenActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.code === 'Escape') {
        e.stopPropagation();
        setStageScreenActive(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isScreenActive, setStageScreenActive]);

  if (!isScreenActive) return null;

  return (
    <div
      role="region"
      aria-label="Stage Screen Playback Controls"
      data-testid="stage-screen-overlay"
      className="fixed bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92vw] max-w-md sm:w-auto min-w-[300px] sm:min-w-[380px] bg-slate-950/95 border border-festive-gold/70 rounded-2xl shadow-2xl p-3 sm:px-4 sm:py-2.5 text-white backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200"
    >
      <div className="flex items-center justify-between gap-3 sm:gap-5">
        {/* Left: TV icon + truthful stable indicator STAGE SCREEN ACTIVE */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-red-600 via-amber-600 to-festive-gold flex items-center justify-center text-white shadow-md shrink-0">
            <Tv className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col text-left">
            <div className="text-xs sm:text-sm font-bold text-festive-gold flex items-center gap-2 whitespace-nowrap">
              <span>STAGE SCREEN ACTIVE</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
            </div>
            <div className="text-[11px] text-amber-200/80 flex items-center gap-1.5 whitespace-nowrap">
              <span>3D Sangeet Stage</span>
              <span>•</span>
              <a
                href={SANGEET_VIDEO_CONFIG.WATCH_URL}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="stage-screen-youtube-external-link"
                className="text-amber-400 hover:text-white underline inline-flex items-center gap-1"
              >
                <span>YouTube</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Right: Stop Button */}
        <button
          type="button"
          data-testid="stage-screen-stop-btn"
          onClick={() => setStageScreenActive(false)}
          aria-label="Stop stage screen playback"
          className="shrink-0 py-1.5 px-3 sm:px-3.5 rounded-xl bg-red-600/90 hover:bg-red-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer border border-red-400/40"
        >
          <X className="w-3.5 h-3.5" />
          <span>Stop [Esc]</span>
        </button>
      </div>
    </div>
  );
};
