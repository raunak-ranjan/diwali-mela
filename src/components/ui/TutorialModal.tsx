import React, { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../../stores/useGameStore';
import {
  Compass,
  Sparkles,
  Gamepad2,
  Flame,
  ArrowRight,
  ArrowLeft,
  X,
  Check,
} from 'lucide-react';

const TUTORIAL_STEPS = [
  {
    title: 'Movement & Camera Navigation',
    hindiTitle: 'मेला परिभ्रमण व दृश्य',
    icon: <Compass className="w-8 h-8 text-amber-400" />,
    description: 'Stroll naturally through the illuminated festival pathways and enjoy panoramic 360-degree views of the celebration.',
    desktopControls: 'WASD or Arrow Keys to walk • Mouse drag to rotate camera',
    mobileControls: 'Virtual Joystick on left • Touch drag right side of screen to look around',
    highlightBadge: 'Exploration',
  },
  {
    title: 'Jumping & Physics Movement',
    hindiTitle: 'कूद व भौतिक गति',
    icon: <Gamepad2 className="w-8 h-8 text-amber-400" />,
    description: 'The mela features believable physics with jumping and gravity. Leap onto curbs, stage steps, and over decorative walkways.',
    desktopControls: 'Spacebar to jump while grounded',
    mobileControls: 'Tap the dedicated Jump button above the joystick',
    highlightBadge: 'Kinematics',
  },
  {
    title: 'Interacting & Kindling Sacred Diyas',
    hindiTitle: 'संवाद व दीप प्रज्वलन',
    icon: <Flame className="w-8 h-8 text-amber-400" />,
    description: 'Approach stalls, game booths, and golden sacred diyas. Interaction prompts will guide you to engage and kindle lamps.',
    desktopControls: 'Press [E] when interaction prompt appears',
    mobileControls: 'Tap the on-screen golden prompt badge directly',
    highlightBadge: 'Seva & Quest',
  },
  {
    title: 'Attractions, Games & Festivities',
    hindiTitle: 'झूला, खेल व सांस्कृतिक मंच',
    icon: <Sparkles className="w-8 h-8 text-amber-400" />,
    description: 'Ride the Giant Ferris Wheel for aerial views, enjoy classical Hindustani ragas at the Sangeet Stage, win carnival tokens, and ignite fireworks.',
    desktopControls: 'Press [E] at attraction queues or booths',
    mobileControls: 'Tap attraction triggers or booth counters',
    highlightBadge: 'Mela Magic',
  },
] as const;

export const TutorialModal: React.FC = () => {
  const activeModal = useGameStore((s) => s.activeModal);
  const closeModal = useGameStore((s) => s.closeModal);
  const setTutorialCompleted = useGameStore((s) => s.setTutorialCompleted);
  const reducedMotion = useGameStore((s) => s.settings.reducedMotion);

  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(true);

  const handleFinish = useCallback(() => {
    if (dontShowAgain) {
      setTutorialCompleted(true);
    }
    closeModal();
  }, [dontShowAgain, setTutorialCompleted, closeModal]);

  // Keyboard navigation: Left/Right arrow to navigate steps, Escape to close
  useEffect(() => {
    if (activeModal !== 'tutorial') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleFinish();
      } else if (e.key === 'ArrowRight') {
        setCurrentStep((prev) => Math.min(prev + 1, TUTORIAL_STEPS.length - 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, handleFinish]);

  if (activeModal !== 'tutorial') return null;

  const step = TUTORIAL_STEPS[currentStep];
  const isLast = currentStep === TUTORIAL_STEPS.length - 1;

  const animClass = reducedMotion ? '' : 'animate-in fade-in zoom-in-95 duration-200';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
    >
      <div
        className={`relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-festive-nightBlue to-slate-950 border-2 border-festive-gold/60 rounded-3xl shadow-2xl p-5 sm:p-7 text-white flex flex-col overflow-hidden select-none ${animClass}`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/30">
          <div className="flex items-center gap-2">
            <span className="text-xl">🪔</span>
            <div>
              <h2
                id="tutorial-modal-title"
                className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-festive-gold to-yellow-200"
              >
                Mela Guide & Controls Walkthrough
              </h2>
              <span className="text-[10px] text-amber-300/80 uppercase tracking-wider font-semibold">
                Step {currentStep + 1} of {TUTORIAL_STEPS.length} • {step.hindiTitle}
              </span>
            </div>
          </div>

          <button
            onClick={handleFinish}
            className="text-slate-400 hover:text-white p-1 rounded-full transition-colors cursor-pointer"
            aria-label="Skip and Close Tutorial"
            title="Skip Tutorial"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Progress Dots */}
        <div className="flex justify-center gap-2 my-4">
          {TUTORIAL_STEPS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              aria-label={`Go to step ${idx + 1}`}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentStep
                  ? 'w-8 bg-gradient-to-r from-festive-gold to-yellow-300 shadow-sm shadow-amber-400/50'
                  : idx < currentStep
                  ? 'w-2.5 bg-amber-500/50'
                  : 'w-2.5 bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Card Body */}
        <div className="bg-slate-950/60 border border-amber-500/20 rounded-2xl p-4 sm:p-5 flex flex-col items-center text-center my-1">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-3 shadow-inner">
            {step.icon}
          </div>

          <span className="text-[10px] uppercase font-bold tracking-widest text-festive-saffron bg-amber-950/70 border border-amber-500/30 rounded-full px-2.5 py-0.5 mb-1.5">
            {step.highlightBadge}
          </span>

          <h3 className="text-base sm:text-lg font-bold text-white mb-1.5">
            {step.title}
          </h3>

          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-4 max-w-sm">
            {step.description}
          </p>

          {/* Controls Box */}
          <div className="w-full space-y-1.5 text-left text-xs bg-slate-900/80 border border-slate-800 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <span className="font-bold text-festive-gold min-w-[70px] shrink-0">Desktop:</span>
              <span className="text-gray-200">{step.desktopControls}</span>
            </div>
            <div className="flex items-start gap-2 pt-1.5 border-t border-slate-800">
              <span className="font-bold text-amber-300 min-w-[70px] shrink-0">Mobile:</span>
              <span className="text-gray-200">{step.mobileControls}</span>
            </div>
          </div>
        </div>

        {/* Footer Controls & Checkbox */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
            />
            <span>Don't show this walkthrough automatically on startup</span>
          </label>

          <div className="flex items-center justify-between gap-3">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="py-2 px-3 sm:px-4 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="py-2 px-3 sm:px-4 rounded-xl text-xs text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                Skip Guide
              </button>
            )}

            {!isLast ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="py-2 px-4 sm:px-6 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 active:scale-95 text-slate-950 transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <span>Next Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="py-2 px-4 sm:px-6 rounded-xl font-bold text-xs bg-gradient-to-r from-festive-gold via-yellow-400 to-amber-500 hover:brightness-110 active:scale-95 text-slate-950 transition-all shadow-lg shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Enter Fairground</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
