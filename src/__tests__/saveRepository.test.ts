import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalSaveRepository, DEFAULT_SAVE_DATA } from '../systems/saveRepository';
import type { SaveDataV1 } from '../types/game';

describe('LocalSaveRepository', () => {
  let repo: LocalSaveRepository;
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    repo = new LocalSaveRepository();
    mockStorage = {};

    vi.stubGlobal('localStorage', {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, val: string) => {
        mockStorage[key] = val;
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
      clear: () => {
        mockStorage = {};
      },
    });
  });

  it('loads default data when localStorage is empty', async () => {
    const data = await repo.load();
    expect(data.version).toBe(1);
    expect(data.tokens).toBe(DEFAULT_SAVE_DATA.tokens);
    expect(data.inventory.items['gulab_jamun']).toBe(1);
  });

  it('successfully persists and loads valid save data', async () => {
    const customSave: SaveDataV1 = {
      ...DEFAULT_SAVE_DATA,
      tokens: 250,
      litDiyas: ['diya_1', 'diya_2'],
      stats: {
        ...DEFAULT_SAVE_DATA.stats,
        balloonHighScore: 140,
      },
    };

    const saved = await repo.save(customSave);
    expect(saved).toBe(true);

    const loaded = await repo.load();
    expect(loaded.tokens).toBe(250);
    expect(loaded.litDiyas).toContain('diya_1');
    expect(loaded.stats.balloonHighScore).toBe(140);
  });

  it('gracefully handles corrupted JSON in localStorage', async () => {
    mockStorage['diwali_mela_save_v1'] = 'CORRUPTED_{{{NOT_JSON';
    const data = await repo.load();
    expect(data.version).toBe(1);
    expect(data.tokens).toBe(DEFAULT_SAVE_DATA.tokens);
  });

  it('gracefully falls back when save schema version is invalid or fields are missing', async () => {
    mockStorage['diwali_mela_save_v1'] = JSON.stringify({
      version: 999, // unsupported future version
      tokens: -50,
    });
    const data = await repo.load();
    expect(data.version).toBe(1);
    expect(data.tokens).toBe(DEFAULT_SAVE_DATA.tokens);
  });

  it('resets progress back to default state', async () => {
    await repo.save({
      ...DEFAULT_SAVE_DATA,
      tokens: 999,
    });

    const resetData = await repo.reset();
    expect(resetData.tokens).toBe(DEFAULT_SAVE_DATA.tokens);

    const reloaded = await repo.load();
    expect(reloaded.tokens).toBe(DEFAULT_SAVE_DATA.tokens);
  });

  it('safely falls back to in-memory storage when localStorage is disabled or throws', async () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('SecurityError: The operation is insecure.');
      },
      setItem: () => {
        throw new Error('SecurityError: The operation is insecure.');
      },
      removeItem: () => {
        throw new Error('SecurityError: The operation is insecure.');
      },
    });

    const safeRepo = new LocalSaveRepository();
    const data = await safeRepo.load();
    expect(data.tokens).toBe(50);

    const saved = await safeRepo.save({
      ...data,
      tokens: 300,
    });
    expect(saved).toBe(true);

    const reloaded = await safeRepo.load();
    expect(reloaded.tokens).toBe(300);
  });

  // --- Focused Regression Tests for Phase 5B Save-System Audit ---

  it('migrates unversioned legacy save data seamlessly from legacy key', async () => {
    // Simulate legacy storage key with unversioned payload
    mockStorage['diwali_mela_save'] = JSON.stringify({
      tokens: 175,
      inventory: { items: { 'gulab_jamun': 3, 'kandil_lantern': 1 } },
      litDiyas: ['diya_1', 'diya_2', 'diya_1'], // contains duplicate to test deduplication
    });

    const loaded = await repo.load();
    expect(loaded.version).toBe(1);
    expect(loaded.tokens).toBe(175);
    expect(loaded.inventory.items['gulab_jamun']).toBe(3);
    expect(loaded.inventory.items['kandil_lantern']).toBe(1);
    // Deduplication verified
    expect(loaded.litDiyas).toEqual(['diya_1', 'diya_2']);
    // Total tokens earned populated at least equal to current tokens
    expect(loaded.stats.totalTokensEarned).toBeGreaterThanOrEqual(175);
    // Migrated data written to current storage key
    expect(mockStorage['diwali_mela_save_v1']).toBeDefined();
  });

  it('repairs partial save where individual stats or settings fields are missing', async () => {
    mockStorage['diwali_mela_save_v1'] = JSON.stringify({
      version: 1,
      tokens: 85,
      inventory: { items: { 'earthen_diya': 10 } },
      litDiyas: ['diya_a'],
      stats: {
        balloonHighScore: 60,
        // missing ringTossHighScore, rangoliCompleted, fireworksWatchedCount
      },
      // missing settings completely
    });

    const loaded = await repo.load();
    expect(loaded.tokens).toBe(85);
    expect(loaded.stats.balloonHighScore).toBe(60);
    expect(loaded.stats.ringTossHighScore).toBe(0); // filled with default
    expect(loaded.stats.rangoliCompleted).toBe(false);
    expect(loaded.stats.fireworksWatchedCount).toBe(0);
    expect(loaded.stats.totalTokensEarned).toBe(85); // guaranteed >= current tokens
    expect(loaded.settings.graphicsQuality).toBe('high');
    expect(loaded.settings.reducedMotion).toBe(false);
  });

  it('rejects saving invalid or negative tokens and avoids corrupting storage', async () => {
    // Valid initial save
    await repo.save({
      ...DEFAULT_SAVE_DATA,
      tokens: 100,
    });

    // Attempt corrupt save with negative tokens
    const invalidSave = {
      ...DEFAULT_SAVE_DATA,
      tokens: -50,
    } as any;
    const saveResult = await repo.save(invalidSave);
    expect(saveResult).toBe(false);

    // Reloaded data must still hold the previous valid tokens
    const reloaded = await repo.load();
    expect(reloaded.tokens).toBe(100);
  });

  it('ensures full progress survives save and reload cycles', async () => {
    const complexSave: SaveDataV1 = {
      version: 1,
      tokens: 145,
      inventory: {
        items: {
          'gulab_jamun': 4,
          'phooljhadi': 2,
        },
      },
      litDiyas: ['entrance_1', 'entrance_2', 'plaza_center'],
      stats: {
        balloonHighScore: 180,
        ringTossHighScore: 90,
        diyasLitCount: 3,
        rangoliCompleted: true,
        totalTokensEarned: 220,
        fireworksWatchedCount: 2,
      },
      settings: {
        graphicsQuality: 'medium',
        masterVolume: 0.7,
        sfxVolume: 0.9,
        musicVolume: 0.5,
        touchSensitivity: 1.2,
        reducedMotion: true,
        ambientFireworks: false,
      },
      lastSavedAt: 1729000000000,
    };

    const saved = await repo.save(complexSave);
    expect(saved).toBe(true);

    const reloaded = await repo.load();
    expect(reloaded.tokens).toBe(145);
    expect(reloaded.inventory.items['phooljhadi']).toBe(2);
    expect(reloaded.litDiyas).toEqual(['entrance_1', 'entrance_2', 'plaza_center']);
    expect(reloaded.stats.balloonHighScore).toBe(180);
    expect(reloaded.stats.ringTossHighScore).toBe(90);
    expect(reloaded.stats.diyasLitCount).toBe(3);
    expect(reloaded.stats.rangoliCompleted).toBe(true);
    expect(reloaded.stats.totalTokensEarned).toBe(220);
    expect(reloaded.stats.fireworksWatchedCount).toBe(2);
    expect(reloaded.settings.reducedMotion).toBe(true);
    expect(reloaded.settings.touchSensitivity).toBe(1.2);
  });
});
