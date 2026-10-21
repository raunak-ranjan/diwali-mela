import React, { useState } from 'react';
import { useGameStore } from '../../stores/useGameStore';
import { soundEngine } from '../../audio/soundEngine';
import { Palette, CheckCircle2, RotateCcw, X } from 'lucide-react';

const COLORS = [
  { name: 'Gulal Red', hex: '#e11d48' },
  { name: 'Marigold Gold', hex: '#f59e0b' },
  { name: 'Turmeric Yellow', hex: '#fbbf24' },
  { name: 'Peacock Blue', hex: '#0284c7' },
  { name: 'Parrot Green', hex: '#10b981' },
  { name: 'Festive Purple', hex: '#9333ea' },
  { name: 'Rice White', hex: '#f8fafc' },
];

export const RangoliEditorUI: React.FC = () => {
  const activeModal = useGameStore((s) => s.activeModal);
  const closeModal = useGameStore((s) => s.closeModal);
  const addTokens = useGameStore((s) => s.addTokens);

  const [selectedColor, setSelectedColor] = useState(COLORS[0].hex);
  // 16 petal segments in mandala
  const [segments, setSegments] = useState<string[]>(Array(16).fill('#1e293b'));
  const [completed, setCompleted] = useState(false);

  if (activeModal !== 'rangoli') return null;

  const handleSegmentClick = (index: number) => {
    soundEngine.playDiyaLight();
    const updated = [...segments];
    updated[index] = selectedColor;
    setSegments(updated);

    // Check if fully painted
    const allFilled = updated.every((c) => c !== '#1e293b');
    if (allFilled && !completed) {
      setCompleted(true);
      addTokens(25); // Award 25 tokens for completing Rangoli!
    }
  };

  const handleReset = () => {
    setSegments(Array(16).fill('#1e293b'));
    setCompleted(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn select-none">
      <div className="relative max-w-xl w-full bg-gradient-to-b from-festive-nightBlue to-slate-950 border-2 border-festive-gold/60 rounded-3xl shadow-2xl p-5 md:p-6 text-white flex flex-col items-center">
        {/* Header */}
        <div className="flex items-center justify-between w-full pb-3 border-b border-amber-500/30">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-festive-saffron" />
            <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-festive-gold to-festive-saffron">
              RANGOLI ART CHALLENGE
            </h2>
          </div>
          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-gray-300 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-amber-200/80 my-2 text-center">
          Select vibrant festival powders and color the mandala petals to bring good fortune!
        </p>

        {/* Color Palette Selection */}
        <div className="flex gap-2 my-2 flex-wrap justify-center">
          {COLORS.map((c) => (
            <button
              key={c.hex}
              onClick={() => setSelectedColor(c.hex)}
              style={{ backgroundColor: c.hex }}
              className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer shadow-md ${
                selectedColor === c.hex ? 'scale-125 border-white ring-2 ring-amber-400' : 'border-black/40'
              }`}
              title={c.name}
            />
          ))}
        </div>

        {/* Circular Mandala Canvas */}
        <div className="relative w-64 h-64 md:w-72 md:h-72 my-4 rounded-full border-4 border-festive-gold/60 p-2 bg-slate-950 flex items-center justify-center shadow-2xl shadow-amber-500/20">
          {/* Petals */}
          <svg className="w-full h-full" viewBox="-110 -110 220 220">
            {segments.map((color, idx) => {
              const count = segments.length;
              const angleStart = (idx / count) * 360;
              const angleEnd = ((idx + 1) / count) * 360;
              const r1 = 30;
              const r2 = 95;

              // Polar to cartesian
              const radStart = (angleStart * Math.PI) / 180;
              const radEnd = (angleEnd * Math.PI) / 180;

              const x1 = r1 * Math.cos(radStart);
              const y1 = r1 * Math.sin(radStart);
              const x2 = r2 * Math.cos(radStart);
              const y2 = r2 * Math.sin(radStart);

              const x3 = r2 * Math.cos(radEnd);
              const y3 = r2 * Math.sin(radEnd);
              const x4 = r1 * Math.cos(radEnd);
              const y4 = r1 * Math.sin(radEnd);

              const path = `M ${x1} ${y1} L ${x2} ${y2} A ${r2} ${r2} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${r1} ${r1} 0 0 0 ${x1} ${y1} Z`;

              return (
                <path
                  key={idx}
                  data-testid="rangoli-petal"
                  d={path}
                  fill={color}
                  stroke="#0f172a"
                  strokeWidth="2"
                  onClick={() => handleSegmentClick(idx)}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                />
              );
            })}
            {/* Center Golden Core */}
            <circle cx="0" cy="0" r="28" fill="#fbbf24" stroke="#d97706" strokeWidth="3" />
            <text x="0" y="6" textAnchor="middle" fontSize="16" fill="#78350f" fontWeight="bold">
              ॐ
            </text>
          </svg>
        </div>

        {/* Completion Message */}
        {completed && (
          <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-2xl py-2 px-4 mb-3 text-center flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-200">
              Rangoli Complete! +25 Virtual Tokens Awarded!
            </span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 w-full justify-center">
          <button
            onClick={handleReset}
            className="py-2 px-4 rounded-xl border border-slate-700 bg-slate-900 text-xs font-semibold hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Rangoli</span>
          </button>
          <button
            onClick={closeModal}
            className="py-2 px-6 rounded-xl bg-gradient-to-r from-festive-gold to-festive-saffron text-amber-950 font-bold text-xs hover:brightness-110 active:scale-95 cursor-pointer"
          >
            Close & Save
          </button>
        </div>
      </div>
    </div>
  );
};
