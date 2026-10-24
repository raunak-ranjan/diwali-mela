import React, { useEffect } from 'react';
import { useGameStore } from '../../stores/useGameStore';
import { soundEngine } from '../../audio/soundEngine';
import { Music, Play, Pause, Sparkles, X, Sun, Palette, Video } from 'lucide-react';

export const CulturalStageModal: React.FC = () => {
  const activeModal = useGameStore((s) => s.activeModal);
  const openModal = useGameStore((s) => s.openModal);
  const closeModal = useGameStore((s) => s.closeModal);
  const isPlayingMusic = useGameStore((s) => s.culturalStageState.isPlayingMusic);
  const activeRaag = useGameStore((s) => s.culturalStageState.activeRaag);
  const lightingTheme = useGameStore((s) => s.culturalStageState.lightingTheme);
  const setStagePlayingMusic = useGameStore((s) => s.setStagePlayingMusic);
  const setStageRaag = useGameStore((s) => s.setStageRaag);
  const setStageLightingTheme = useGameStore((s) => s.setStageLightingTheme);

  // Keyboard navigation & Escape key
  useEffect(() => {
    if (activeModal !== 'stage') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, closeModal]);

  // Clean up stage concert music if component unmounts while playing
  useEffect(() => {
    return () => {
      if (useGameStore.getState().culturalStageState.isPlayingMusic) {
        setStagePlayingMusic(false);
      }
    };
  }, [setStagePlayingMusic]);

  if (activeModal !== 'stage') return null;

  const raagas = [
    { id: 'Raag Yaman', name: 'Raag Yaman', time: 'Golden Evening', mood: 'Serene, Devotional & Majestic' },
    { id: 'Raag Bhairavi', name: 'Raag Bhairavi', time: 'Festive Dawn', mood: 'Joyous, Celebratory & Sweet' },
    { id: 'Raag Desh', name: 'Raag Desh', time: 'Celebration', mood: 'Patriotic, Romantic & Uplifting' },
  ];

  const lightingOptions: Array<{ id: 'gold' | 'peacock' | 'saffron'; label: string; desc: string }> = [
    { id: 'gold', label: 'Festive Gold', desc: 'Warm temple oil lamp ambience' },
    { id: 'peacock', label: 'Peacock Azure', desc: 'Turquoise & royal magenta spotlights' },
    { id: 'saffron', label: 'Royal Saffron', desc: 'Deep marigold & amber radiance' },
  ];

  const handleApplaud = () => {
    soundEngine.playTokenEarned();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="stage-modal-title"
      data-testid="cultural-stage-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      <div className="relative max-w-xl w-full max-h-[92vh] bg-gradient-to-b from-slate-900 via-[#1a1429] to-slate-950 border-2 border-festive-gold/70 rounded-3xl shadow-2xl p-5 md:p-6 text-white flex flex-col justify-between overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-festive-gold flex items-center justify-center text-amber-950 shadow-md shrink-0">
              <Music className="w-5 h-5 text-amber-950" />
            </div>
            <div>
              <h2
                id="stage-modal-title"
                className="text-lg sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-festive-gold via-amber-200 to-festive-saffron"
              >
                CULTURAL SANGEET STAGE
              </h2>
              <p className="text-[11px] sm:text-xs text-amber-300/80">
                Traditional Diwali Concert, Classical Ragas & Live Ambiance
              </p>
            </div>
          </div>

          <button
            type="button"
            data-testid="close-stage-modal-btn"
            onClick={closeModal}
            aria-label="Close stage panel"
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-gray-300 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Performance Status Banner */}
        <div className="my-3 p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900/80 to-amber-950/60 border border-amber-500/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-3.5 h-3.5 rounded-full ${
                isPlayingMusic ? 'bg-red-500 animate-ping' : 'bg-slate-600'
              }`}
            />
            <div>
              <div className="text-xs font-bold text-festive-gold flex items-center gap-1.5">
                <span>{isPlayingMusic ? 'LIVE CONCERT PLAYING' : 'INTERMISSION (PAUSED)'}</span>
                {isPlayingMusic && <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />}
              </div>
              <div className="text-[11px] text-amber-100/90 font-serif">
                {activeRaag} • Classical Sitar & Harmonium Melody
              </div>
            </div>
          </div>

          <button
            type="button"
            data-testid="stage-play-pause-btn"
            onClick={() => setStagePlayingMusic(!isPlayingMusic)}
            className={`py-2 px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer ${
              isPlayingMusic
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-gradient-to-r from-festive-gold to-festive-saffron text-amber-950 hover:brightness-110'
            }`}
          >
            {isPlayingMusic ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Start Concert</span>
              </>
            )}
          </button>
        </div>

        {/* Raag Selection */}
        <div className="my-2">
          <label className="text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-festive-gold" />
            <span>Select Festival Raag:</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {raagas.map((raag) => (
              <button
                key={raag.id}
                type="button"
                data-testid={`raag-select-${raag.id.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setStageRaag(raag.name)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  activeRaag === raag.name
                    ? 'bg-amber-950/70 border-festive-gold text-white shadow-md'
                    : 'bg-slate-900/60 border-slate-800 text-gray-400 hover:border-slate-700 hover:text-gray-200'
                }`}
              >
                <div className="text-xs font-bold text-festive-gold">{raag.name}</div>
                <div className="text-[10px] text-amber-200/70">{raag.time}</div>
                <div className="text-[9px] text-gray-400 mt-0.5 truncate">{raag.mood}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Stage Lighting Controls */}
        <div className="my-2">
          <label className="text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-festive-gold" />
            <span>Stage Lighting & Visual Ambience:</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {lightingOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                data-testid={`lighting-select-${opt.id}`}
                onClick={() => setStageLightingTheme(opt.id)}
                className={`py-2 px-2.5 rounded-xl text-center border transition-all cursor-pointer ${
                  lightingTheme === opt.id
                    ? 'bg-gradient-to-r from-festive-gold/30 to-festive-saffron/30 border-festive-gold text-festive-gold shadow-md font-bold'
                    : 'bg-slate-900/60 border-slate-800 text-gray-400 hover:border-slate-700 hover:text-gray-200 font-medium'
                }`}
              >
                <div className="text-xs">{opt.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Stage Interactive Action: Applaud Musicians */}
        <div className="my-2 flex items-center justify-between bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3">
          <div className="text-xs text-gray-300">
            <span className="font-bold text-festive-gold">Audience Reaction: </span>
            <span>Cheer and applaud the classical musicians!</span>
          </div>
          <button
            type="button"
            data-testid="stage-applaud-btn"
            onClick={handleApplaud}
            className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-200 font-bold text-xs flex items-center gap-1.5 border border-amber-500/30 cursor-pointer active:scale-95 transition-all"
          >
            <span>👏 Applaud</span>
          </button>
        </div>

        {/* Watch Cultural Performance Video Banner */}
        <div className="my-2.5 p-3 rounded-2xl bg-gradient-to-r from-red-950/60 via-slate-900/80 to-amber-950/60 border border-festive-gold/60 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white shadow shrink-0">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-festive-gold flex items-center gap-1.5">
                <span>Watch Cultural Performance</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-600/90 text-white font-semibold">Video</span>
              </div>
              <div className="text-[11px] text-amber-100/80">
                Traditional festive sangeet & celebration video showcase
              </div>
            </div>
          </div>

          <button
            type="button"
            data-testid="stage-watch-video-btn"
            onClick={() => openModal('stage_video')}
            className="w-full sm:w-auto py-2 px-3.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow active:scale-95 transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Watch Video</span>
          </button>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={closeModal}
          className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-festive-gold to-festive-saffron text-amber-950 font-bold text-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-lg"
        >
          Return to Fairground
        </button>
      </div>
    </div>
  );
};
