import { create } from 'zustand';

interface InputState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  interact: boolean;
  /** Jump key (Space). Only tracked on desktop; mobile uses dedicated button. */
  jump: boolean;
  joystickVector: { x: number; y: number };
  touchLookDelta: { x: number; y: number };
  isTouchDevice: boolean;

  // Direct setters for snappy response
  setKey: (key: 'forward' | 'backward' | 'left' | 'right' | 'interact' | 'jump', state: boolean) => void;
  setJoystickVector: (x: number, y: number) => void;
  addTouchLookDelta: (dx: number, dy: number) => void;
  resetTouchLookDelta: () => void;
  setIsTouchDevice: (val: boolean) => void;
}

const detectTouchSync = () => {
  if (typeof window === 'undefined') return false;
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    Boolean(window.matchMedia && window.matchMedia('(pointer: coarse)').matches)
  );
};

export const useInputStore = create<InputState>((set) => ({
  forward: false,
  backward: false,
  left: false,
  right: false,
  interact: false,
  jump: false,
  joystickVector: { x: 0, y: 0 },
  touchLookDelta: { x: 0, y: 0 },
  isTouchDevice: detectTouchSync(),

  setKey: (key, state) => set((s) => ({ ...s, [key]: state })),
  setJoystickVector: (x, y) => set({ joystickVector: { x, y } }),
  addTouchLookDelta: (dx, dy) =>
    set((s) => ({
      touchLookDelta: {
        x: s.touchLookDelta.x + dx,
        y: s.touchLookDelta.y + dy,
      },
    })),
  resetTouchLookDelta: () => set({ touchLookDelta: { x: 0, y: 0 } }),
  setIsTouchDevice: (val) => set({ isTouchDevice: val }),
}));
