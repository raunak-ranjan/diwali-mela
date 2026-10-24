import React from 'react';
import { useGameStore } from '../../stores/useGameStore';
import { useNpcStore } from '../../stores/useNpcStore';
import { Settings, Volume2, Monitor, Trash2, X, Eye, Users, Sparkles } from 'lucide-react';
import type { GraphicsQuality } from '../../types/game';

export const SettingsModal: React.FC = () => {
  const activeModal = useGameStore((s) => s.activeModal);
  const closeModal = useGameStore((s) => s.closeModal);
  const settings = useGameStore((s) => s.settings);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const resetProgress = useGameStore((s) => s.resetProgress);
  const crowdDensity = useNpcStore((s) => s.crowdDensity);
  const setCrowdDensity = useNpcStore((s) => s.setCrowdDensity);

  if (activeModal !== 'settings') return null;

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset your festival tokens, items, and lit diyas?')) {
      await resetProgress();
      closeModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative max-w-md w-full bg-slate-900 border-2 border-festive-gold/60 rounded-3xl shadow-2xl p-5 md:p-6 text-white flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-festive-saffron" />
            <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-festive-gold to-festive-saffron">
              MELA SETTINGS
            </h2>
          </div>
          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-gray-300 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 my-4 text-xs">
          {/* Graphics Quality */}
          <div>
            <label className="flex items-center gap-1.5 font-bold text-gray-300 mb-1.5">
              <Monitor className="w-4 h-4 text-festive-gold" />
              <span>Graphics Quality</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as GraphicsQuality[]).map((q) => (
                <button
                  key={q}
                  onClick={() => updateSettings({ graphicsQuality: q })}
                  className={`py-2 rounded-xl font-bold uppercase transition-all cursor-pointer ${
                    settings.graphicsQuality === q
                      ? 'bg-gradient-to-r from-festive-gold to-festive-saffron text-amber-950 shadow-md'
                      : 'bg-slate-800 hover:bg-slate-700 text-gray-300'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
            <div className="text-[10px] text-gray-400 mt-1">
              Low: High-performance mobile • High: Crisp shadows & rich lighting
            </div>
          </div>

          {/* Master Volume */}
          <div>
            <div className="flex justify-between font-bold text-gray-300 mb-1">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-festive-gold" />
                <span>Master Volume</span>
              </span>
              <span className="font-mono text-festive-gold">{Math.round(settings.masterVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.masterVolume}
              onChange={(e) => updateSettings({ masterVolume: parseFloat(e.target.value) })}
              className="w-full accent-festive-gold cursor-pointer"
            />
          </div>

          {/* Touch Sensitivity */}
          <div>
            <div className="flex justify-between font-bold text-gray-300 mb-1">
              <span>Mobile Touch Camera Sensitivity</span>
              <span className="font-mono text-festive-gold">{settings.touchSensitivity}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={settings.touchSensitivity}
              onChange={(e) => updateSettings({ touchSensitivity: parseFloat(e.target.value) })}
              className="w-full accent-festive-gold cursor-pointer"
            />
          </div>

                    {/* Reduced Motion Toggle */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between font-bold text-gray-300 py-1">
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-festive-gold" />
                <span>Reduced Motion</span>
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={settings.reducedMotion}
                aria-label="Reduced Motion"
                onClick={() => updateSettings({ reducedMotion: !settings.reducedMotion })}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  settings.reducedMotion ? 'bg-festive-gold' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    settings.reducedMotion ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">
              Softens fireworks speed and disables pendulum oscillations for visual comfort.
            </div>
          </div>

          {/* Ambient Fireworks Toggle */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between font-bold text-gray-300 py-1">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-festive-gold" />
                <span>Ambient Sky Fireworks</span>
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={settings.ambientFireworks}
                aria-label="Ambient Sky Fireworks"
                onClick={() => updateSettings({ ambientFireworks: !settings.ambientFireworks })}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  settings.ambientFireworks ? 'bg-festive-gold' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    settings.ambientFireworks ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">
              Periodic celebratory distant firework bursts over the royal horizon.
            </div>
          </div>

          {/* Ambient Visitors / Crowd Density */}
          <div className="pt-2 border-t border-slate-800">
            <label className="flex items-center gap-1.5 font-bold text-gray-300 mb-1.5">
              <Users className="w-4 h-4 text-festive-gold" />
              <span>Ambient Visitors (Crowd Density)</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['full', 'reduced', 'off'] as const).map((density) => (
                <button
                  key={density}
                  type="button"
                  data-testid={`crowd-density-${density}`}
                  onClick={() => setCrowdDensity(density)}
                  className={`py-2 rounded-xl font-bold uppercase text-[11px] transition-all cursor-pointer ${
                    crowdDensity === density
                      ? 'bg-gradient-to-r from-festive-gold to-festive-saffron text-amber-950 shadow-md'
                      : 'bg-slate-800 hover:bg-slate-700 text-gray-300'
                  }`}
                >
                  {density}
                </button>
              ))}
            </div>
            <div className="text-[10px] text-gray-400 mt-1">
              Full: Lively festival crowd • Reduced: Essential visitors • Off: Maximum performance
            </div>
          </div>

          {/* Reset Save Progress */}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={handleReset}
              className="w-full py-2.5 rounded-xl border border-red-500/40 bg-red-950/20 hover:bg-red-950/40 text-red-300 font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Reset Saved Festival Progress</span>
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={closeModal}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-festive-gold to-festive-saffron text-amber-950 font-bold text-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer mt-2"
        >
          Save & Return to Mela
        </button>
      </div>
    </div>
  );
};
