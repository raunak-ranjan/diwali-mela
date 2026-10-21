import React, { useRef } from 'react';
import { useGameStore } from '../../stores/useGameStore';
import { useInputStore } from '../../stores/useInputStore';
import { soundEngine } from '../../audio/soundEngine';
import { Coins, Volume2, VolumeX, Settings, Sparkles } from 'lucide-react';
import { QuestTracker } from './QuestTracker';

export const HUD: React.FC = () => {
  const tokens = useGameStore((s) => s.tokens);
  const currentZone = useGameStore((s) => s.currentZone);
  const activeModal = useGameStore((s) => s.activeModal);
  const openModal = useGameStore((s) => s.openModal);
  const settings = useGameStore((s) => s.settings);
  const updateSettings = useGameStore((s) => s.updateSettings);

  const addTouchLookDelta = useInputStore((s) => s.addTouchLookDelta);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  if (activeModal !== 'none') return null;

  const zoneNames: Record<string, string> = {
    entrance: 'Grand Diwali Entrance Gate',
    central_plaza: 'Central Rangoli Plaza',
    food_street: 'Food & Sweets Bazaar',
    shopping_street: 'Handicrafts & Diya Lane',
    carnival: 'Carnival Games Booths',
    ferris_wheel: 'Giant Illuminated Ferris Wheel',
    cultural_stage: 'Cultural Performance Stage',
    celebration_area: 'Grand Celebration Plaza',
  };

  const handleMuteToggle = () => {
    const isMuted = settings.masterVolume === 0;
    const newVol = isMuted ? 0.8 : 0;
    updateSettings({ masterVolume: newVol });
    soundEngine.toggleMute(!isMuted);
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-30 flex flex-col justify-between p-3 md:p-6">
      {/* Top Bar */}
      <div className="flex items-start justify-between w-full pointer-events-none">
        {/* Left Column: Token Counter & Quest Tracker */}
        <div className="flex flex-col items-start pointer-events-auto">
          {/* Token Counter */}
          <div className="flex items-center gap-2.5 bg-slate-900/80 backdrop-blur-md border border-festive-gold/50 rounded-full py-1.5 px-4 shadow-lg shadow-amber-500/10">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-600 to-festive-gold flex items-center justify-center text-amber-950 font-bold shadow-inner animate-pulse">
              <Coins className="w-4 h-4 text-amber-950" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300/80">Tokens</span>
              <span className="text-lg font-black leading-none text-festive-gold font-mono">{tokens}</span>
            </div>
          </div>

          {/* Festival Quest Tracker */}
          <QuestTracker />
        </div>

        {/* Current Zone Badge */}
        <div className="hidden sm:flex flex-col items-center bg-slate-900/80 backdrop-blur-md border border-amber-500/30 rounded-2xl py-1.5 px-5 shadow-lg pointer-events-auto">
          <span className="text-[10px] uppercase tracking-widest text-festive-saffron font-bold">Location</span>
          <span className="text-sm font-semibold text-white">{zoneNames[currentZone] || 'Diwali Mela'}</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Grand Fireworks Finale Quick Trigger */}
          <button
            onClick={() => openModal('finale')}
            aria-label="Grand Fireworks"
            title="Watch Grand Fireworks Celebration"
            className="flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-amber-600 hover:brightness-110 active:scale-95 transition-all text-white text-xs font-bold py-2 px-3.5 rounded-full shadow-lg border border-festive-gold/60 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-festive-gold animate-bounce" />
            <span className="hidden md:inline">Grand Fireworks</span>
          </button>

          {/* Sound Mute */}
          <button
            onClick={handleMuteToggle}
            className="w-9 h-9 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700 hover:border-festive-gold flex items-center justify-center text-amber-200 hover:text-white transition-all shadow-md cursor-pointer"
            title="Toggle Sound"
          >
            {settings.masterVolume > 0 ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
          </button>

          {/* Settings */}
          <button
            onClick={() => openModal('settings')}
            className="w-9 h-9 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700 hover:border-festive-gold flex items-center justify-center text-amber-200 hover:text-white transition-all shadow-md cursor-pointer"
            title="Settings & Controls"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Touch Camera Look Area (Right 45% of screen) */}
      <div
        className="absolute right-0 top-16 bottom-24 w-1/2 pointer-events-auto sm:hidden"
        onTouchStart={(e) => {
          if (e.touches[0]) {
            touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
          }
        }}
        onTouchMove={(e) => {
          if (touchStartRef.current && e.touches[0]) {
            const dx = e.touches[0].clientX - touchStartRef.current.x;
            const dy = e.touches[0].clientY - touchStartRef.current.y;
            touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            addTouchLookDelta(dx, dy);
          }
        }}
        onTouchEnd={() => {
          touchStartRef.current = null;
        }}
      />
    </div>
  );
};
