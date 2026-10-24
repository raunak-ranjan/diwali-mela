import React, { useEffect } from 'react';
import { useGameStore } from '../../stores/useGameStore';
import { SANGEET_VIDEO_CONFIG } from '../../utils/attractionConfig';
import { Video, X, ExternalLink, Sparkles, Film } from 'lucide-react';

export const SangeetVideoModal: React.FC = () => {
  const activeModal = useGameStore((s) => s.activeModal);
  const closeModal = useGameStore((s) => s.closeModal);

  // Keyboard shortcut: Escape to close video modal and return to game
  useEffect(() => {
    if (activeModal !== 'stage_video') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, closeModal]);

  if (activeModal !== 'stage_video') return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sangeet-video-title"
      data-testid="sangeet-video-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 animate-in fade-in duration-200"
    >
      <div className="relative max-w-3xl w-full max-h-[94vh] bg-gradient-to-b from-slate-900 via-[#181326] to-slate-950 border-2 border-festive-gold/80 rounded-3xl shadow-2xl p-4 sm:p-6 text-white flex flex-col justify-between overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 via-amber-600 to-festive-gold flex items-center justify-center text-white shadow-md shrink-0">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2
                id="sangeet-video-title"
                className="text-base sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-festive-gold via-amber-200 to-festive-saffron flex items-center gap-2"
              >
                <span>{SANGEET_VIDEO_CONFIG.TITLE}</span>
                <Sparkles className="w-4 h-4 text-festive-gold" />
              </h2>
              <p className="text-[11px] sm:text-xs text-amber-300/80">
                {SANGEET_VIDEO_CONFIG.SUBTITLE}
              </p>
            </div>
          </div>

          <button
            type="button"
            data-testid="close-sangeet-video-btn"
            onClick={closeModal}
            aria-label="Close performance video"
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-gray-300 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Responsive 16:9 Video Player Container */}
        <div className="my-3 w-full rounded-2xl overflow-hidden bg-black/90 border border-amber-500/40 shadow-inner flex items-center justify-center aspect-video relative">
          <iframe
            src={SANGEET_VIDEO_CONFIG.EMBED_URL}
            title={SANGEET_VIDEO_CONFIG.TITLE}
            data-testid="sangeet-youtube-iframe"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full border-0 rounded-2xl"
          />
        </div>

        {/* Graceful Fallback & Restrictions Notice Bar */}
        <div className="mb-3 px-3.5 py-2.5 rounded-2xl bg-slate-950/70 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div className="text-gray-300 flex items-center gap-2">
            <Video className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-[11px] sm:text-xs">
              If playback is restricted by your browser or network, watch directly on YouTube:
            </span>
          </div>

          <a
            href={SANGEET_VIDEO_CONFIG.WATCH_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="youtube-external-link"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-700/80 hover:bg-red-600 text-white font-semibold text-xs transition-colors shrink-0"
          >
            <span>Open on YouTube</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-amber-500/20">
          <button
            type="button"
            data-testid="return-fairground-btn"
            onClick={closeModal}
            className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-gradient-to-r from-festive-gold to-festive-saffron text-amber-950 font-bold text-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-lg"
          >
            Return to Fairground [Esc]
          </button>
        </div>
      </div>
    </div>
  );
};
