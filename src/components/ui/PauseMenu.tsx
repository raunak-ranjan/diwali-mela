import React from 'react';
import { useGameStore } from '../../stores/useGameStore';
import { Play, Settings, HelpCircle } from 'lucide-react';

export const PauseMenu: React.FC = () => {
  const activeModal = useGameStore((s) => s.activeModal);
  const closeModal = useGameStore((s) => s.closeModal);
  const openModal = useGameStore((s) => s.openModal);

  if (activeModal !== 'pause') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative max-w-sm w-full bg-slate-900 border-2 border-festive-gold/60 rounded-3xl shadow-2xl p-6 text-center text-white flex flex-col items-center">
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-festive-gold to-festive-saffron mb-1">
          PAUSED
        </h2>
        <div className="text-xs text-amber-200/80 mb-6">Diwali Mela Experience</div>

        <div className="w-full space-y-3">
          <button
            onClick={closeModal}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-festive-gold to-festive-saffron text-amber-950 font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Resume Fair</span>
          </button>

          <button
            onClick={() => openModal('settings')}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
          >
            <Settings className="w-4 h-4 text-festive-gold" />
            <span>Settings & Audio</span>
          </button>

          <button
            onClick={() => openModal('welcome')}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
          >
            <HelpCircle className="w-4 h-4 text-festive-saffron" />
            <span>Controls & Info</span>
          </button>
        </div>

        <div className="mt-6 text-[11px] text-gray-400">
          Press [ESC] at any time to resume
        </div>
      </div>
    </div>
  );
};
