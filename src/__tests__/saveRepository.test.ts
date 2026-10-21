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
});
