import React from 'react';
import { useGameStore } from '../../stores/useGameStore';
import { interactionRegistry } from '../../systems/interactionRegistry';
import { Sparkles, Video } from 'lucide-react';

export const InteractionPrompt: React.FC = () => {
  const prompt = useGameStore((s) => s.prompt);
  const activeModal = useGameStore((s) => s.activeModal);

  if (!prompt || !prompt.active || activeModal !== 'none') return null;

  const handleClick = () => {
    const target = interactionRegistry.get(prompt.id);
    if (target) {
      target.onInteract();
    }
  };

  const handleSecondaryClick = () => {
    if (prompt.secondaryAction) {
      prompt.secondaryAction.onAction();
    }
  };

  return (
    <div className="fixed bottom-24 sm:bottom-12 inset-x-0 pointer-events-none z-30 flex flex-col sm:flex-row items-center justify-center gap-2 px-4 animate-slideUp">
      <button
        onClick={handleClick}
        className="pointer-events-auto bg-slate-900/90 hover:bg-slate-800/90 active:scale-95 transition-all border border-festive-gold/60 shadow-2xl rounded-2xl py-2.5 px-5 flex items-center gap-3 text-white max-w-md w-full sm:w-auto cursor-pointer"
      >
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
      </button>

      {prompt.secondaryAction && (
        <button
          onClick={handleSecondaryClick}
          data-testid="prompt-secondary-action-btn"
          className="pointer-events-auto bg-gradient-to-r from-red-950/90 via-slate-900/90 to-amber-950/90 hover:brightness-110 active:scale-95 transition-all border border-amber-400/80 shadow-2xl rounded-2xl py-2.5 px-5 flex items-center gap-3 text-white max-w-md w-full sm:w-auto cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white font-black shrink-0 text-sm shadow-md">
            {prompt.secondaryAction.keyHint || 'V'}
          </div>
          <div className="flex flex-col text-left">
            <div className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-red-400" />
              <span>{prompt.secondaryAction.label}</span>
            </div>
            {prompt.secondaryAction.sublabel && (
              <div className="text-xs text-amber-200/80 font-medium">
                {prompt.secondaryAction.sublabel}
              </div>
            )}
          </div>
        </button>
      )}
    </div>
  );
};
