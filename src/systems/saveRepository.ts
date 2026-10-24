import { createDefaultMissionJournal } from './progressionLogic';
import { KNOWN_MISSION_IDS, type MissionJournalSaveState } from '../types/missions';
import { KNOWN_COLLECTIBLE_IDS } from '../types/collectibles';
import { KNOWN_ACHIEVEMENT_IDS } from '../types/achievements';
import type { SaveDataV1, MiniGameStats } from '../types/game';
import { KNOWN_COSMETIC_IDS, type TokenTransaction } from '../types/rewards';
import { type DailyDarshanSaveState, getCalendarDateString } from '../types/daily';

export interface ISaveRepository {
  load(): Promise<SaveDataV1>;
  save(data: SaveDataV1): Promise<boolean>;
  reset(): Promise<SaveDataV1>;
  hasSavedData(): boolean;
}

export const DEFAULT_SAVE_DATA: SaveDataV1 = {
  version: 1,
  tokens: 50, // Welcome gift of 50 Diwali fair tokens!
  inventory: {
    items: {
      'gulab_jamun': 1,
      'earthen_diya': 5,
    },
  },
  stats: {
    balloonHighScore: 0,
    ringTossHighScore: 0,
    diyasLitCount: 0,
    rangoliCompleted: false,
    totalTokensEarned: 50,
    fireworksWatchedCount: 0,
    magicalDiyasCollected: 0,
    questCompleted: false,
    shrineOfferingsCount: 0,
  },
  litDiyas: [],
  quest: {
    collectedDiyas: [],
    isCompleted: false,
  },
  collectibles: [],
  achievements: [],
  claimedAchievements: [],
  missions: createDefaultMissionJournal(),
  cosmetics: {
    unlocked: [],
    equipped: null,
  },
  tokenHistory: [
    {
      id: 'welcome_gift',
      amount: 50,
      source: 'Festival Welcome Gift',
      timestamp: Date.now(),
    },
  ],
  dailyDarshan: {
    date: getCalendarDateString(),
    progress: {},
    isClaimed: false,
    streak: 0,
    lastCompletedDate: null,
    claimedDates: [],
  },
  settings: {
    graphicsQuality: 'high',
    masterVolume: 0.8,
    sfxVolume: 0.8,
    musicVolume: 0.6,
    touchSensitivity: 1.0,
    reducedMotion: false,
    ambientFireworks: true,
  },
  lastSavedAt: Date.now(),
};

const STORAGE_KEY = 'diwali_mela_save_v1';
const LEGACY_STORAGE_KEYS = ['diwali_mela_save', 'diwali_mela_save_v0'];

export class LocalSaveRepository implements ISaveRepository {
  private memoryFallback: SaveDataV1 | null = null;
  private _storageAvailable: boolean | null = null;

  private getStorage(): Storage | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage;
      }
      if (typeof localStorage !== 'undefined') {
        return localStorage;
      }
      return null;
    } catch {
      return null;
    }
  }

  private isStorageAvailable(): boolean {
    if (this._storageAvailable !== null) return this._storageAvailable;
    try {
      const storage = this.getStorage();
      if (!storage) {
        this._storageAvailable = false;
        return false;
      }
      const testKey = '__diwali_storage_probe__';
      storage.setItem(testKey, '1');
      storage.removeItem(testKey);
      this._storageAvailable = true;
      return true;
    } catch {
      this._storageAvailable = false;
      return false;
    }
  }

  hasSavedData(): boolean {
    try {
      const storage = this.getStorage();
      if (!this.isStorageAvailable() || !storage) {
        return this.memoryFallback !== null;
      }
      if (storage.getItem(STORAGE_KEY)) return true;
      for (const legacyKey of LEGACY_STORAGE_KEYS) {
        if (storage.getItem(legacyKey)) return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async load(): Promise<SaveDataV1> {
    if (typeof (this as any).flushPendingSave === 'function') {
      (this as any).flushPendingSave();
    }
    try {
      const storage = this.getStorage();
      if (!this.isStorageAvailable() || !storage) {
        return this.memoryFallback
          ? (this.migrateAndSanitize(this.memoryFallback) || this.getDefault())
          : this.getDefault();
      }

      let serialized = storage.getItem(STORAGE_KEY);
      let isLegacyKey = false;

      // Check legacy storage keys if current key does not exist
      if (!serialized) {
        for (const legacyKey of LEGACY_STORAGE_KEYS) {
          const legacyData = storage.getItem(legacyKey);
          if (legacyData) {
            serialized = legacyData;
            isLegacyKey = true;
            break;
          }
        }
      }

      if (!serialized) {
        return this.memoryFallback
          ? JSON.parse(JSON.stringify(this.memoryFallback))
          : this.getDefault();
      }

      let parsed: any;
      try {
        parsed = JSON.parse(serialized);
      } catch {
        console.warn('[SaveRepository] JSON parse error in save data. Falling back safely.');
        return this.memoryFallback
          ? JSON.parse(JSON.stringify(this.memoryFallback))
          : this.getDefault();
      }

      const sanitized = this.migrateAndSanitize(parsed);
      if (!sanitized) {
        console.warn('[SaveRepository] Corrupted save schema detected. Falling back safely.');
        return this.memoryFallback
          ? JSON.parse(JSON.stringify(this.memoryFallback))
          : this.getDefault();
      }

      // If migrated from legacy key or schema upgrade, persist to current key
      if (isLegacyKey || parsed.version !== 1) {
        try {
          storage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
        } catch {
          // ignore storage failure during migration
        }
      }

      this.memoryFallback = JSON.parse(JSON.stringify(sanitized));
      return sanitized;
    } catch (err) {
      console.error('[SaveRepository] Error loading save data from localStorage:', err);
      return this.memoryFallback
        ? JSON.parse(JSON.stringify(this.memoryFallback))
        : this.getDefault();
    }
  }

  async save(data: SaveDataV1): Promise<boolean> {
    try {
      if (!this.isValid(data)) {
        console.error('[SaveRepository] Attempted to persist invalid save data schema.');
        return false;
      }
      const sanitized = this.migrateAndSanitize(data) || data;
      const dataWithTimestamp: SaveDataV1 = {
        ...sanitized,
        lastSavedAt: Date.now(),
      };
      const serialized = JSON.stringify(dataWithTimestamp);
      this.memoryFallback = JSON.parse(serialized);

      const storage = this.getStorage();
      if (this.isStorageAvailable() && storage) {
        storage.setItem(STORAGE_KEY, serialized);
      }
      return true;
    } catch (err) {
      console.error('[SaveRepository] Error writing save data:', err);
      return false;
    }
  }

  async reset(): Promise<SaveDataV1> {
    const fresh = this.getDefault();
    await this.save(fresh);
    return fresh;
  }

  private getDefault(): SaveDataV1 {
    return JSON.parse(JSON.stringify(DEFAULT_SAVE_DATA));
  }

  private isValid(data: any): boolean {
    if (!data || typeof data !== 'object') return false;
    if (data.version !== 1) return false;
    if (typeof data.tokens !== 'number' || isNaN(data.tokens) || data.tokens < 0) return false;
    if (!data.inventory || typeof data.inventory.items !== 'object') return false;
    if (!data.stats || typeof data.stats !== 'object') return false;
    if (!Array.isArray(data.litDiyas)) return false;
    if (!data.settings || typeof data.settings !== 'object') return false;
    if (data.quest !== undefined) {
      if (!data.quest || typeof data.quest !== 'object') return false;
      if (!Array.isArray(data.quest.collectedDiyas)) return false;
    }
    if (data.cosmetics !== undefined) {
      if (!data.cosmetics || typeof data.cosmetics !== 'object') return false;
      if (!Array.isArray(data.cosmetics.unlocked)) return false;
      if (data.cosmetics.equipped !== null && typeof data.cosmetics.equipped !== 'string') return false;
    }
    if (data.tokenHistory !== undefined && !Array.isArray(data.tokenHistory)) return false;
    return true;
  }

  /**
   * Migrates unversioned or legacy schema saves and sanitizes missing/invalid fields
   * so user progress is never discarded due to schema evolutions.
   */
  private migrateAndSanitize(data: any): SaveDataV1 | null {
    if (!data || typeof data !== 'object') return null;

    // Check if tokens is valid; if completely corrupt or negative, reject
    if (data.tokens !== undefined && (typeof data.tokens !== 'number' || isNaN(data.tokens) || data.tokens < 0)) {
      return null;
    }

    // Reject future unsupported versions (e.g. version > 1)
    if (typeof data.version === 'number' && data.version > 1) {
      return null;
    }

    const defaultSave = this.getDefault();

    const tokens = typeof data.tokens === 'number' && !isNaN(data.tokens) && data.tokens >= 0
      ? data.tokens
      : defaultSave.tokens;

    // Sanitize inventory: retain explicitly stored quantities, guaranteeing non-negative integers
    // Do not re-seed items from defaultSave if they were consumed down to 0
    let items: Record<string, number> = {};
    if (data.inventory && typeof data.inventory.items === 'object' && data.inventory.items !== null) {
      for (const [key, val] of Object.entries(data.inventory.items)) {
        if (typeof val === 'number' && !isNaN(val)) {
          items[key] = Math.max(0, Math.floor(val));
        }
      }
      for (const [defKey, defVal] of Object.entries(defaultSave.inventory.items)) {
        if (!(defKey in data.inventory.items)) {
          items[defKey] = defVal;
        }
      }
    } else {
      items = { ...defaultSave.inventory.items };
    }

    // Sanitize lit diyas (deduplicate array)
    const litDiyas: string[] = Array.isArray(data.litDiyas)
      ? Array.from(new Set(data.litDiyas.filter((id: unknown): id is string => typeof id === 'string')))
      : defaultSave.litDiyas;

    // Sanitize stats
    const rawStats = (data.stats && typeof data.stats === 'object') ? data.stats : {};
    const stats: MiniGameStats = {
      balloonHighScore: typeof rawStats.balloonHighScore === 'number' && rawStats.balloonHighScore >= 0
        ? rawStats.balloonHighScore
        : 0,
      ringTossHighScore: typeof rawStats.ringTossHighScore === 'number' && rawStats.ringTossHighScore >= 0
        ? rawStats.ringTossHighScore
        : 0,
      diyasLitCount: typeof rawStats.diyasLitCount === 'number' && rawStats.diyasLitCount >= 0
        ? rawStats.diyasLitCount
        : litDiyas.length,
      rangoliCompleted: Boolean(rawStats.rangoliCompleted),
      totalTokensEarned: typeof rawStats.totalTokensEarned === 'number' && rawStats.totalTokensEarned >= tokens
        ? rawStats.totalTokensEarned
        : tokens,
      fireworksWatchedCount: typeof rawStats.fireworksWatchedCount === 'number' && rawStats.fireworksWatchedCount >= 0
        ? rawStats.fireworksWatchedCount
        : 0,
            shrineOfferingsCount: typeof rawStats.shrineOfferingsCount === 'number' && rawStats.shrineOfferingsCount >= 0
        ? rawStats.shrineOfferingsCount
        : 0,
      balloonLeaderboard: Array.isArray(rawStats.balloonLeaderboard)
        ? rawStats.balloonLeaderboard
            .filter((e: any) => e && typeof e.score === 'number' && Number.isFinite(e.score))
            .slice(0, 5)
            .map((e: any) => ({
              score: Math.floor(e.score),
              date: typeof e.date === 'string' ? e.date : new Date().toISOString().split('T')[0],
            }))
        : [],
      ringTossLeaderboard: Array.isArray(rawStats.ringTossLeaderboard)
        ? rawStats.ringTossLeaderboard
            .filter((e: any) => e && typeof e.score === 'number' && Number.isFinite(e.score))
            .slice(0, 5)
            .map((e: any) => ({
              score: Math.floor(e.score),
              date: typeof e.date === 'string' ? e.date : new Date().toISOString().split('T')[0],
            }))
        : [],
    };

    // Sanitize quest progress
    const rawQuest = data.quest && typeof data.quest === 'object' ? data.quest : {};
    const collectedDiyas: string[] = Array.isArray(rawQuest.collectedDiyas)
      ? Array.from(new Set(rawQuest.collectedDiyas.filter((id: unknown): id is string => typeof id === 'string')))
      : (Array.isArray(data.collectedMagicalDiyas)
        ? Array.from(new Set(data.collectedMagicalDiyas.filter((id: unknown): id is string => typeof id === 'string')))
        : defaultSave.quest?.collectedDiyas || []);
    const isCompleted = Boolean(rawQuest.isCompleted || rawStats.questCompleted);
    const quest = {
      collectedDiyas,
      isCompleted,
    };

    stats.magicalDiyasCollected = typeof rawStats.magicalDiyasCollected === 'number' && rawStats.magicalDiyasCollected >= 0
      ? rawStats.magicalDiyasCollected
      : quest.collectedDiyas.length;
    stats.questCompleted = quest.isCompleted;

    // Sanitize cosmetics
    const rawCosmetics = data.cosmetics && typeof data.cosmetics === 'object' ? data.cosmetics : {};
    const unlocked: string[] = Array.isArray(rawCosmetics.unlocked)
      ? Array.from(new Set(rawCosmetics.unlocked.filter((id: unknown): id is string => typeof id === 'string' && (KNOWN_COSMETIC_IDS as readonly string[]).includes(id))))
      : defaultSave.cosmetics?.unlocked || [];
    const rawEquipped = typeof rawCosmetics.equipped === 'string' ? rawCosmetics.equipped : null;
    const equipped = rawEquipped && unlocked.includes(rawEquipped) ? rawEquipped : null;
    const cosmetics = {
      unlocked,
      equipped,
    };


    // Sanitize collectibles
    const collectibles: string[] = Array.isArray(data.collectibles)
      ? Array.from(new Set(data.collectibles.filter((id: unknown): id is string => typeof id === 'string' && (KNOWN_COLLECTIBLE_IDS as readonly string[]).includes(id))))
      : [];

    // Sanitize achievements
    const achievements: string[] = Array.isArray(data.achievements)
      ? Array.from(new Set(data.achievements.filter((id: unknown): id is string => typeof id === 'string' && (KNOWN_ACHIEVEMENT_IDS as readonly string[]).includes(id))))
      : [];

    // Sanitize claimed achievements
    const claimedAchievements: string[] = Array.isArray(data.claimedAchievements)
      ? Array.from(new Set(data.claimedAchievements.filter((id: unknown): id is string => typeof id === 'string' && (KNOWN_ACHIEVEMENT_IDS as readonly string[]).includes(id))))
      : [];

    // Sanitize missions
    let missions: MissionJournalSaveState = createDefaultMissionJournal();
    if (data.missions && typeof data.missions === 'object') {
      const rawMissions = data.missions as any;
      const activeId = typeof rawMissions.activeMissionId === 'string' && (KNOWN_MISSION_IDS as readonly string[]).includes(rawMissions.activeMissionId)
        ? rawMissions.activeMissionId
        : missions.activeMissionId;
      const progressMap = typeof rawMissions.progress === 'object' && rawMissions.progress !== null
        ? rawMissions.progress
        : {};
      const sanitizedProgress = { ...missions.progress };
      for (const missionId of KNOWN_MISSION_IDS) {
        if (progressMap[missionId]) {
          const p = progressMap[missionId];
          sanitizedProgress[missionId] = {
            currentStepIndex: typeof p.currentStepIndex === 'number' && p.currentStepIndex >= 0 ? p.currentStepIndex : 0,
            stepCounts: typeof p.stepCounts === 'object' && p.stepCounts !== null ? p.stepCounts : {},
            isCompleted: Boolean(p.isCompleted),
            isClaimed: Boolean(p.isClaimed),
          };
        }
      }
      missions = {
        activeMissionId: activeId,
        progress: sanitizedProgress,
      };
    }

    // Sanitize token history
    const rawHistory = Array.isArray(data.tokenHistory) ? data.tokenHistory : [];
    const tokenHistory: TokenTransaction[] = rawHistory
      .filter((t: any) => t && typeof t === 'object' && typeof t.amount === 'number' && !isNaN(t.amount) && typeof t.source === 'string')
      .slice(-20)
      .map((t: any) => ({
        id: typeof t.id === 'string' ? t.id : `tx_${Date.now()}_${Math.random()}`,
        amount: t.amount,
        source: t.source,
        timestamp: typeof t.timestamp === 'number' ? t.timestamp : Date.now(),
      }));
    if (tokenHistory.length === 0) {
      tokenHistory.push({
        id: 'welcome_gift',
        amount: tokens,
        source: 'Festival Welcome Gift',
        timestamp: typeof data.lastSavedAt === 'number' ? data.lastSavedAt : Date.now(),
      });
    }

    // Sanitize settings
    const rawSettings = (data.settings && typeof data.settings === 'object') ? data.settings : {};
    const settings = {
      ...defaultSave.settings,
      ...rawSettings,
    };

    // Sanitize daily darshan
    const rawDaily = data.dailyDarshan && typeof data.dailyDarshan === 'object' ? data.dailyDarshan : {};
    const todayStr = getCalendarDateString();
    const rawDate = typeof rawDaily.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(rawDaily.date)
      ? rawDaily.date
      : todayStr;
    const rawProgress = rawDaily.progress && typeof rawDaily.progress === 'object' && rawDaily.progress !== null
      ? rawDaily.progress
      : {};
    const sanitizedProgress: Record<string, number> = {};
    for (const [k, v] of Object.entries(rawProgress)) {
      if (typeof v === 'number' && !isNaN(v) && v >= 0) {
        sanitizedProgress[k] = v;
      }
    }
    const rawClaimedDates = Array.isArray(rawDaily.claimedDates)
      ? rawDaily.claimedDates.filter((d: unknown): d is string => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)).slice(-30)
      : [];
    const isClaimed = Boolean(rawDaily.isClaimed) || rawClaimedDates.includes(rawDate);
    const streak = typeof rawDaily.streak === 'number' && rawDaily.streak >= 0 ? rawDaily.streak : 0;
    const lastCompletedDate = typeof rawDaily.lastCompletedDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(rawDaily.lastCompletedDate)
      ? rawDaily.lastCompletedDate
      : null;

    const dailyDarshan: DailyDarshanSaveState = {
      date: rawDate,
      progress: sanitizedProgress,
      isClaimed,
      streak,
      lastCompletedDate,
      claimedDates: rawClaimedDates,
    };

    if (stats.dailyStreak === undefined) {
      stats.dailyStreak = streak;
    }

    return {
      version: 1,
      tokens,
      inventory: { items },
      litDiyas,
      stats,
      quest,
      collectibles,
      achievements,
      claimedAchievements,
      missions,
      cosmetics,
      tokenHistory,
      dailyDarshan,
      settings,
      lastSavedAt: typeof data.lastSavedAt === 'number' ? data.lastSavedAt : Date.now(),
    };
  }
}

export const saveRepository = new LocalSaveRepository();
