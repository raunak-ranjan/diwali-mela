import { create } from 'zustand';
import type { CrowdDensity, NpcPersonality, NpcOutfit } from '../types/npc';
import { npcCoordinator } from '../systems/npcCoordinator';
import { useGameStore } from './useGameStore';

export interface VendorGreetingState {
  vendorId: string;
  vendorName: string;
  shopName: string;
  text: string;
  accent?: string;
}

export interface ActiveVisitorDialogue {
  visitorId: string;
  visitorName: string;
  role: string;
  personality: NpcPersonality;
  outfit: NpcOutfit;
  greeting: string;
  greetingHindi?: string;
  festivalTip: string;
  currentThought: string;
  currentActivity: string;
}

export interface SpectatorReactionState {
  active: boolean;
  type: 'applause' | 'cheer' | 'focused';
  focusPoint?: [number, number, number];
  timestamp: number;
}

interface NpcStoreState {
  crowdDensity: CrowdDensity;
  greetingsEnabled: boolean;
  activeGreeting: VendorGreetingState | null;

  // Living World Visitor Dialogue & Interactions
  activeVisitorDialogue: ActiveVisitorDialogue | null;
  visitorCooldowns: Record<string, number>; // visitorId -> timestamp in ms when cooldown expires
  spectatorReaction: SpectatorReactionState;

  setCrowdDensity: (density: CrowdDensity) => void;
  setGreeting: (greeting: VendorGreetingState | null) => void;
  toggleGreetings: () => void;
  clearGreeting: () => void;

  openVisitorDialogue: (dialogue: ActiveVisitorDialogue) => void;
  closeVisitorDialogue: () => void;
  setVisitorCooldown: (visitorId: string, durationSeconds?: number) => void;
  isVisitorOnCooldown: (visitorId: string) => boolean;
  triggerSpectatorReaction: (type: 'applause' | 'cheer' | 'focused', focusPoint?: [number, number, number]) => void;
}

export const useNpcStore = create<NpcStoreState>((set, get) => ({
  crowdDensity: 'full',
  greetingsEnabled: true,
  activeGreeting: null,

  activeVisitorDialogue: null,
  visitorCooldowns: {},
  spectatorReaction: {
    active: false,
    type: 'focused',
    timestamp: 0,
  },

  setCrowdDensity: (density) => set({ crowdDensity: density }),
  setGreeting: (greeting) => set({ activeGreeting: greeting }),
  toggleGreetings: () => set((s) => ({ greetingsEnabled: !s.greetingsEnabled })),
  clearGreeting: () => set({ activeGreeting: null }),

  openVisitorDialogue: (dialogue) => {
    // Also record cooldown so immediate re-trigger doesn't spam
    const now = Date.now();
    set((s) => ({
      activeVisitorDialogue: dialogue,
      visitorCooldowns: {
        ...s.visitorCooldowns,
        [dialogue.visitorId]: now + 8000, // 8s cooldown
      },
    }));
    useGameStore.getState().openModal('dialogue');
  },

  closeVisitorDialogue: () => {
    set({ activeVisitorDialogue: null });
    const activeModal = useGameStore.getState().activeModal;
    if (activeModal === 'dialogue') {
      useGameStore.getState().closeModal();
    }
  },

  setVisitorCooldown: (visitorId, durationSeconds = 8) => {
    const expiresAt = Date.now() + durationSeconds * 1000;
    set((s) => ({
      visitorCooldowns: {
        ...s.visitorCooldowns,
        [visitorId]: expiresAt,
      },
    }));
  },

  isVisitorOnCooldown: (visitorId) => {
    const expiresAt = get().visitorCooldowns[visitorId];
    if (!expiresAt) return false;
    return Date.now() < expiresAt;
  },

  triggerSpectatorReaction: (type, focusPoint) => {
    set({
      spectatorReaction: {
        active: true,
        type,
        focusPoint,
        timestamp: Date.now(),
      },
    });
  },
}));

// Expose on window for automated test control and inspectability
if (typeof window !== 'undefined') {
  (window as any).__setNpcDensity = (density: CrowdDensity) => {
    useNpcStore.getState().setCrowdDensity(density);
  };
  (window as any).__getNpcDensity = () => {
    return useNpcStore.getState().crowdDensity;
  };
  (window as any).__getActiveVendorGreeting = () => {
    return useNpcStore.getState().activeGreeting;
  };
  (window as any).__getActiveVisitorDialogue = () => {
    return useNpcStore.getState().activeVisitorDialogue;
  };
  (window as any).__isVisitorOnCooldown = (id: string) => {
    return useNpcStore.getState().isVisitorOnCooldown(id);
  };
  (window as any).__getMelaQueue = (queueId: string) => {
    return npcCoordinator.getQueue(queueId);
  };
  (window as any).__npcCoordinator = npcCoordinator;
  window.addEventListener('test-set-greeting', (e: any) => {
    if (e.detail) {
      useNpcStore.getState().setGreeting(e.detail);
    }
  });
}
