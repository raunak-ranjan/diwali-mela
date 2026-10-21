import React from 'react';
import { useGameStore } from '../../stores/useGameStore';
import { Sparkles } from 'lucide-react';

export const InteractionPrompt: React.FC = () => {
  const prompt = useGameStore((s) => s.prompt);
  const activeModal = useGameStore((s) => s.activeModal);

  if (!prompt || !prompt.active || activeModal !== 'none') return null;

  return (
    <div className="fixed bottom-24 sm:bottom-12 inset-x-0 pointer-events-none z-30 flex justify-center px-4 animate-slideUp">
      <div className="bg-slate-900/90 backdrop-blur-md border border-festive-gold/60 shadow-2xl rounded-2xl py-2.5 px-5 flex items-center gap-3 text-white max-w-md">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-festive-gold flex items-center justify-center text-amber-950 font-black shrink-0 text-sm shadow-md">
          E
        </div>
        <div className="flex flex-col text-left">
          <div className="text-sm font-bold text-festive-gold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-festive-amber" />
            <span>{prompt.label}</span>
          </div>
          {prompt.sublabel && (
            <div className="text-xs text-gray-300 font-medium">{prompt.sublabel}</div>
          )}
        </div>
      </div>
    </div>
  );
};
