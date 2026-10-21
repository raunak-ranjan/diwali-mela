import type { SaveDataV1, MiniGameStats } from '../types/game';
import { KNOWN_COSMETIC_IDS, type TokenTransaction } from '../types/rewards';

export interface ISaveRepository {
  load(): Promise<SaveDataV1>;
  save(data: SaveDataV1): Promise<boolean>;
  reset(): Promise<SaveDataV1>;
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
  },
  litDiyas: [],
  quest: {
    collectedDiyas: [],
    isCompleted: false,
  },
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
  settings: {
    graphicsQuality: 'high',
    masterVolume: 0.8,
    sfxVolume: 0.8,
    musicVolume: 0.6,
    touchSensitivity: 1.0,
    reducedMotion: false,
  },
  lastSavedAt: Date.now(),
};

const STORAGE_KEY = 'diwali_mela_save_v1';
const LEGACY_STORAGE_KEYS = ['diwali_mela_save', 'diwali_mela_save_v0'];

export class LocalSaveRepository implements ISaveRepository {
  private memoryFallback: SaveDataV1 | null = null;

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
    try {
      const storage = this.getStorage();
      if (!storage) return false;
      const testKey = '__diwali_storage_probe__';
      storage.setItem(testKey, '1');
      storage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  async load(): Promise<SaveDataV1> {
    try {
      const storage = this.getStorage();
      if (!this.isStorageAvailable() || !storage) {
        return this.memoryFallback
          ? JSON.parse(JSON.stringify(this.memoryFallback))
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
      const dataWithTimestamp: SaveDataV1 = {
        ...data,
        lastSavedAt: Date.now(),
      };
      this.memoryFallback = JSON.parse(JSON.stringify(dataWithTimestamp));

      const storage = this.getStorage();
      if (this.isStorageAvailable() && storage) {
        storage.setItem(STORAGE_KEY, JSON.stringify(dataWithTimestamp));
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

    // Sanitize inventory
    const items = data.inventory && typeof data.inventory.items === 'object' && data.inventory.items !== null
      ? { ...defaultSave.inventory.items, ...data.inventory.items }
      : defaultSave.inventory.items;

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

    return {
      version: 1,
      tokens,
      inventory: { items },
      litDiyas,
      stats,
      quest,
      cosmetics,
      tokenHistory,
      settings,
      lastSavedAt: typeof data.lastSavedAt === 'number' ? data.lastSavedAt : Date.now(),
    };
  }
}

export const saveRepository = new LocalSaveRepository();
