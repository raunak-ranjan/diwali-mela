import React from 'react';

interface LoadingScreenProps {
  error?: string | null;
  onRetry?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ error, onRetry }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 bg-[#060814] flex flex-col items-center justify-center text-white p-4 select-none z-50"
    >
      {/* Radiant ambient glow */}
      <div className="absolute w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {error ? (
        <div className="relative max-w-sm text-center p-6 bg-slate-900/90 border border-red-500/40 rounded-2xl shadow-2xl">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="text-lg font-bold text-red-400 mb-2">Unable to Load Fairground</h2>
          <p className="text-xs text-gray-300 mb-4">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-festive-saffron text-slate-950 font-bold rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            >
              Retry
            </button>
          )}
        </div>
      ) : (
        <div className="relative flex flex-col items-center text-center">
          {/* Diya Icon */}
          <div className="text-5xl mb-4 motion-safe:animate-pulse">
            🪔
          </div>

          {/* Title */}
          <h1 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-festive-gold via-amber-300 to-festive-saffron tracking-wider font-serif">
            DIWALI MELA
          </h1>

          <div className="text-xs font-semibold uppercase tracking-widest text-amber-300/80 mt-1">
            Igniting Festival Fairground
          </div>

          <p className="text-xs text-amber-200/50 mt-2 max-w-xs">
            Lighting hundreds of traditional diyas and tuning fairground harmonies...
          </p>

          {/* Elegant Indeterminate Progress Line */}
          <div className="w-48 h-1 bg-amber-950/60 rounded-full overflow-hidden mt-6 border border-amber-500/20">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-amber-400 to-transparent motion-safe:animate-[shimmer_1.6s_infinite]" />
          </div>
        </div>
      )}
    </div>
  );
};
