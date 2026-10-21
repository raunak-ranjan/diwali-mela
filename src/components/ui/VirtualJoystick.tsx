import React, { useRef, useState } from 'react';
import { useInputStore } from '../../stores/useInputStore';
import { useGameStore } from '../../stores/useGameStore';
import { interactionRegistry } from '../../systems/interactionRegistry';
import { Hand } from 'lucide-react';

export const VirtualJoystick: React.FC = () => {
  const setJoystickVector = useInputStore((s) => s.setJoystickVector);
  const prompt = useGameStore((s) => s.prompt);
  const activeModal = useGameStore((s) => s.activeModal);

  const [active, setActive] = useState(false);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const touchIdRef = useRef<number | null>(null);
  const baseCenterRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const maxRadius = 45;

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;

    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    baseCenterRef.current = { x: centerX, y: centerY };
    setActive(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        const dx = touch.clientX - baseCenterRef.current.x;
        const dy = touch.clientY - baseCenterRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let clampedX = dx;
        let clampedY = dy;
        if (dist > maxRadius) {
          clampedX = (dx / dist) * maxRadius;
          clampedY = (dy / dist) * maxRadius;
        }

        setKnobPos({ x: clampedX, y: clampedY });
        // Normalized vector
        setJoystickVector(clampedX / maxRadius, clampedY / maxRadius);
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setActive(false);
        setKnobPos({ x: 0, y: 0 });
        setJoystickVector(0, 0);
        break;
      }
    }
  };

  // Dedicated interaction button trigger
  const handleActionClick = () => {
    if (prompt && prompt.active) {
      // Find and trigger
      const target = interactionRegistry.findNearest(
        new (window as any).THREE.Vector3(prompt.position[0], prompt.position[1], prompt.position[2])
      );
      if (target) {
        target.onInteract();
      }
    }
  };

  if (activeModal !== 'none') return null;

  return (
    <div className="fixed inset-x-0 bottom-6 pointer-events-none z-30 flex items-center justify-between px-6 sm:hidden">
      {/* Joystick Base */}
      <div
        className="pointer-events-auto relative w-28 h-28 rounded-full bg-slate-900/50 backdrop-blur-md border-2 border-amber-500/40 flex items-center justify-center touch-none select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        {/* Joystick Thumb Knob */}
        <div
          className={`w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 to-festive-gold shadow-lg shadow-amber-500/50 transition-transform ${
            active ? 'scale-110' : ''
          }`}
          style={{
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          }}
        />
      </div>

      {/* Dedicated Action / Interaction Button */}
      {prompt && prompt.active && (
        <button
          onClick={handleActionClick}
          className="pointer-events-auto w-16 h-16 rounded-full bg-gradient-to-r from-festive-gold to-festive-saffron text-amber-950 font-black flex flex-col items-center justify-center shadow-2xl border-2 border-white/60 active:scale-90 transition-transform animate-bounce"
        >
          <Hand className="w-6 h-6" />
          <span className="text-[10px] uppercase font-bold">Interact</span>
        </button>
      )}
    </div>
  );
};
