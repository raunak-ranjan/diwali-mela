import type { MissionJournalSaveState } from './missions';
import type { PlayerCosmetics, TokenTransaction } from './rewards';
import type { DailyDarshanSaveState } from './daily';

export type GraphicsQuality = 'low' | 'medium' | 'high';

export type GameZone = 
  | 'entrance'
  | 'central_plaza'
  | 'food_street'
  | 'shopping_street'
  | 'carnival'
  | 'ferris_wheel'
  | 'cultural_stage'
  | 'celebration_area';

export interface ShopItem {
  id: string;
  name: string;
  category: 'sweet' | 'snack' | 'handicraft' | 'diya' | 'sparkler';
  price: number;
  description: string;
  hindiName: string;
  icon: string;
  blessing: string;
}

export interface DiyaState {
  id: string;
  position: [number, number, number];
  isLit: boolean;
  intensity: number;
}

export interface PlayerInventory {
  items: Record<string, number>;
}

export interface LeaderboardEntry {
  score: number;
  date: string;
  details?: string;
}

export interface MiniGameStats {
  balloonHighScore: number;
  ringTossHighScore: number;
  diyasLitCount: number;
  rangoliCompleted: boolean;
  totalTokensEarned: number;
  fireworksWatchedCount: number;
  magicalDiyasCollected?: number;
  questCompleted?: boolean;
  dailyStreak?: number;
  dailySetsCompleted?: number;
  shrineOfferingsCount?: number;
  balloonLeaderboard?: LeaderboardEntry[];
  ringTossLeaderboard?: LeaderboardEntry[];
}

export interface QuestProgress {
  collectedDiyas: string[];
  isCompleted: boolean;
}

export interface QuestNotification {
  id: string;
  title: string;
  message: string;
  type: 'collected' | 'completed';
  timestamp: number;
}

export interface SaveDataV1 {
  version: 1;
  tokens: number;
  inventory: PlayerInventory;
  stats: MiniGameStats;
  litDiyas: string[];
  quest?: QuestProgress;
  cosmetics?: PlayerCosmetics;
  tokenHistory?: TokenTransaction[];
  dailyDarshan?: DailyDarshanSaveState;
  collectibles?: string[];
  achievements?: string[];
  claimedAchievements?: string[];
  missions?: MissionJournalSaveState;
  tutorialCompleted?: boolean;
  settings: {
    graphicsQuality: GraphicsQuality;
    masterVolume: number;
    sfxVolume: number;
    musicVolume: number;
    touchSensitivity: number;
    reducedMotion: boolean;
    ambientFireworks: boolean;
  };
  lastSavedAt: number;
}

export interface InteractionPromptAction {
  label: string;
  sublabel?: string;
  keyHint?: string;
  onAction: () => void;
}

export interface InteractionPromptState {
  active: boolean;
  id: string;
  label: string;
  sublabel?: string;
  actionType: 'shop' | 'balloon_game' | 'ring_toss' | 'rangoli' | 'diya' | 'ferris_wheel' | 'stage' | 'fireworks' | 'quest' | 'talk';
  position: [number, number, number];
  secondaryAction?: InteractionPromptAction;
}
