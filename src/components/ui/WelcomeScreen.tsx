import React from 'react';
import { useGameStore } from '../../stores/useGameStore';
import { Sparkles, Compass, Gamepad2 } from 'lucide-react';

export const WelcomeScreen: React.FC = () => {
  const activeModal = useGameStore((s) => s.activeModal);
  const startGame = useGameStore((s) => s.startGame);

  if (activeModal !== 'welcome') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative max-w-xl w-full bg-gradient-to-b from-festive-nightBlue to-festive-deepNavy border-2 border-festive-gold/60 rounded-2xl shadow-2xl p-6 md:p-8 text-center text-white overflow-hidden">
        {/* Decorative corner orbs */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Festive Header */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-3xl">🪔</span>
          <span className="text-sm font-semibold tracking-widest uppercase text-festive-saffron">
            Shubh Deepavali Celebration
          </span>
          <span className="text-3xl">🪔</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-festive-gold via-festive-amber to-festive-saffron font-serif">
          DIWALI MELA 3D
        </h1>
        <p className="text-sm md:text-base text-amber-200/90 mt-2 font-medium">
          Step into a vibrant, realistic Indian festival fairground illuminated by hundreds of golden diyas, fairy lights, festive sweet shops, carnival games, and grand fireworks.
        </p>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 gap-3 my-6 text-left text-xs md:text-sm">
          <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2.5">
            <Compass className="w-5 h-5 text-festive-amber shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-festive-gold">Explore the Fair</div>
              <div className="text-gray-300 text-xs">Toran gate, sweet street, cultural stage & Ferris wheel.</div>
            </div>
          </div>

          <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2.5">
            <Gamepad2 className="w-5 h-5 text-festive-amber shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-festive-gold">Carnival Games</div>
              <div className="text-gray-300 text-xs">Shoot balloons, design rangolis & light sacred diyas.</div>
            </div>
          </div>
        </div>

        {/* Controls Info */}
        <div className="bg-slate-900/60 border border-slate-700/60 rounded-xl p-3 mb-6 text-xs text-gray-300 flex flex-wrap items-center justify-around gap-2">
          <div><span className="font-bold text-festive-gold">WASD / Arrows</span> to Walk</div>
          <div><span className="font-bold text-festive-gold">Mouse / Drag</span> Camera</div>
          <div><span className="font-bold text-festive-gold">[E]</span> to Interact</div>
          <div><span className="font-bold text-festive-gold">Touch Screen</span> Joystick on Mobile</div>
        </div>

        {/* Action Button */}
        <button
          onClick={startGame}
          className="w-full py-3.5 px-6 rounded-xl font-bold text-lg text-amber-950 bg-gradient-to-r from-festive-gold via-amber-400 to-festive-saffron hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-5 h-5" />
          <span>ENTER THE MELA • मेला प्रवेश करें</span>
        </button>

        <div className="mt-3 text-[11px] text-gray-400">
          Audio experience enabled • Web Audio festive sangeet
        </div>
      </div>
    </div>
  );
};
