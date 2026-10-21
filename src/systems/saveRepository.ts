import type { SaveDataV1 } from '../types/game';

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
  },
  litDiyas: [],
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

export class LocalSaveRepository implements ISaveRepository {
  async load(): Promise<SaveDataV1> {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      if (!serialized) {
        return this.getDefault();
      }

      const parsed = JSON.parse(serialized);
      if (!this.isValid(parsed)) {
        console.warn('[SaveRepository] Corrupted or invalid save schema detected. Falling back to default.');
        return this.getDefault();
      }

      return parsed as SaveDataV1;
    } catch (err) {
      console.error('[SaveRepository] Error loading save data from localStorage:', err);
      return this.getDefault();
    }
  }

  async save(data: SaveDataV1): Promise<boolean> {
    try {
      if (!this.isValid(data)) {
        throw new Error('Attempted to persist invalid save data schema.');
      }
      const dataWithTimestamp: SaveDataV1 = {
        ...data,
        lastSavedAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataWithTimestamp));
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
    return true;
  }
}

export const saveRepository = new LocalSaveRepository();
