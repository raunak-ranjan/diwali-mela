export type NpcState = 'idle' | 'walking' | 'pausing' | 'turning' | 'queuing' | 'watching';

export type Waypoint = [number, number, number];

export type NpcPersonality = 'cheerful' | 'curious' | 'devout' | 'foodie' | 'spectator' | 'elder';

export interface VisitorDialogue {
  greeting: string;
  greetingHindi?: string;
  festivalTip: string;
  currentThought: string;
}

export interface VisitorRoutine {
  id: string;
  activityLabel: string;
  activityHindi: string;
  targetZone?: string;
  waypoints: Waypoint[];
  pauseDuration: number;
  targetQueueId?: string;
  watchFocusPoint?: Waypoint;
}

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

export interface MelaQueueConfig {
  id: string;
  name: string;
  servicePoint: Waypoint;
  /** Ordered slots: slot 0 is the front counter/service point, slot 1 is next in line, etc. */
  slots: Waypoint[];
  /** Approximate orientation (yaw) while standing in queue facing the counter/attraction */
  facingYaw: number;
  /** Service duration in seconds at slot 0 */
  serviceDuration: number;
}

export interface AmbientVisitorConfig {
  id: string;
  name: string;
  role: 'stroller' | 'devotee' | 'spectator' | 'shopper';
  personality?: NpcPersonality;
  waypoints: Waypoint[];
  speed: number;
  pauseDuration: number; // in seconds
  outfit: NpcOutfit;
  accessory?: 'diya' | 'sparkler' | 'mala';
  tier: 'essential' | 'standard'; // 'essential' rendered in 'reduced' mode; both rendered in 'full'
  /** Optional queue this visitor is interested in visiting during their mela tour */
  targetQueueId?: string;
  /** Optional specific landmark orientation when pausing/watching */
  watchFocusPoint?: Waypoint;
  /** Living World extensions */
  currentActivity?: string;
  activityHindi?: string;
  dialogues?: VisitorDialogue[];
  routines?: VisitorRoutine[];
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
