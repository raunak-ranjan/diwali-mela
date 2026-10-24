import { create } from 'zustand';
import type { CrowdDensity } from '../types/npc';
import { npcCoordinator } from '../systems/npcCoordinator';

export interface VendorGreetingState {
  vendorId: string;
  vendorName: string;
  shopName: string;
  text: string;
  accent?: string;
}

interface NpcStoreState {
  crowdDensity: CrowdDensity;
  greetingsEnabled: boolean;
  activeGreeting: VendorGreetingState | null;

  setCrowdDensity: (density: CrowdDensity) => void;
  setGreeting: (greeting: VendorGreetingState | null) => void;
  toggleGreetings: () => void;
  clearGreeting: () => void;
}

export const useNpcStore = create<NpcStoreState>((set) => ({
  crowdDensity: 'full',
  greetingsEnabled: true,
  activeGreeting: null,

  setCrowdDensity: (density) => set({ crowdDensity: density }),
  setGreeting: (greeting) => set({ activeGreeting: greeting }),
  toggleGreetings: () => set((s) => ({ greetingsEnabled: !s.greetingsEnabled })),
  clearGreeting: () => set({ activeGreeting: null }),
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
  (window as any).__getMelaQueue = (queueId: string) => {
    return npcCoordinator.getQueue(queueId);
  };
  window.addEventListener('test-set-greeting', (e: any) => {
    if (e.detail) {
      useNpcStore.getState().setGreeting(e.detail);
    }
  });
}
