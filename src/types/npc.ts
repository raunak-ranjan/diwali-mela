export type NpcState = 'idle' | 'walking' | 'pausing' | 'turning';

export type Waypoint = [number, number, number];

export interface NpcOutfit {
  skinColor: string;
  kurtaColor: string;
  stoleColor?: string;
  pagriColor?: string;
  pagriAccentColor?: string;
  pyjamaColor: string;
  juttiColor: string;
}

export type CrowdDensity = 'full' | 'reduced' | 'off';

export interface AmbientVisitorConfig {
  id: string;
  name: string;
  role: 'stroller' | 'devotee' | 'spectator' | 'shopper';
  waypoints: Waypoint[];
  speed: number;
  pauseDuration: number; // in seconds
  outfit: NpcOutfit;
  accessory?: 'diya' | 'sparkler' | 'mala';
  tier: 'essential' | 'standard'; // 'essential' rendered in 'reduced' mode; both rendered in 'full'
}

export interface VendorNpcConfig {
  id: string;
  name: string;
  shopName: string;
  position: [number, number, number];
  rotationY: number;
  outfit: NpcOutfit;
  greetingText: string;
  accentDialogue: string;
}
