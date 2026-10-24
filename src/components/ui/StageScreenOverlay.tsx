import React, { useEffect } from 'react';
import { useGameStore } from '../../stores/useGameStore';
import { SANGEET_VIDEO_CONFIG } from '../../utils/attractionConfig';
import { Tv, ExternalLink, X } from 'lucide-react';

export const StageScreenOverlay: React.FC = () => {
  const isScreenActive = useGameStore((s) => s.culturalStageState.isScreenActive);
  const setStageScreenActive = useGameStore((s) => s.setStageScreenActive);

  // Keyboard shortcut: Escape exits the in-world stage screen playback
  useEffect(() => {
    if (!isScreenActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
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
      className="fixed bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-40 max-w-lg w-[92vw] sm:w-auto bg-gradient-to-r from-slate-950/95 via-[#181326]/95 to-slate-950/95 border-2 border-festive-gold/80 rounded-2xl shadow-2xl p-3 sm:p-4 text-white backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-amber-600 to-festive-gold flex items-center justify-center text-white shadow-md shrink-0">
            <Tv className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-festive-gold to-festive-saffron flex items-center gap-2">
              <span>STAGE SCREEN ACTIVE</span>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            </div>
            <div className="text-[11px] text-amber-200/90 flex items-center gap-2 mt-0.5">
              <span>Playing on 3D Stage Screen</span>
              <span>•</span>
              <a
                href={SANGEET_VIDEO_CONFIG.WATCH_URL}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="stage-screen-youtube-external-link"
                className="text-amber-400 hover:text-white underline inline-flex items-center gap-1"
              >
                <span>Open on YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        <button
          type="button"
          data-testid="stage-screen-stop-btn"
          onClick={() => setStageScreenActive(false)}
          className="w-full sm:w-auto py-2 px-4 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
          <span>Stop Screen [Esc]</span>
        </button>
      </div>
    </div>
  );
};
