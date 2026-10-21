import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from '../stores/useGameStore';
import { LocalSaveRepository, DEFAULT_SAVE_DATA } from '../systems/saveRepository';
import { MAGICAL_DIYAS_CONFIG } from '../types/quest';
import type { SaveDataV1 } from '../types/game';

describe('Festival Quest System — The Five Sacred Lights', () => {
  let repo: LocalSaveRepository;
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    mockStorage = {};
    repo = new LocalSaveRepository();

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

    // Reset store state with clean default quest
    useGameStore.setState({
      tokens: 50,
      inventory: { 'gulab_jamun': 1, 'earthen_diya': 5 },
      litDiyas: [],
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
      quest: {
        id: 'five_sacred_diyas',
        title: 'The Five Sacred Lights',
        description: 'Kindle all 5 Sacred Golden Diyas hidden across the fairground.',
        targetCount: 5,
        collectedDiyas: [],
        isCompleted: false,
        rewardTokens: 50,
      },
      questNotification: null,
      activeModal: 'none',
    });
  });

  it('defines 5 distinct sacred diyas distributed across fairground zones', () => {
    expect(MAGICAL_DIYAS_CONFIG).toHaveLength(5);
    const ids = MAGICAL_DIYAS_CONFIG.map((d) => d.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(5);

    // Each diya has valid 3D coordinates and zone hints
    MAGICAL_DIYAS_CONFIG.forEach((diya) => {
      expect(diya.position).toHaveLength(3);
      expect(diya.name).toBeTruthy();
      expect(diya.zoneHint).toBeTruthy();
    });
  });

  it('advances progress when a magical diya is kindled', () => {
    const success = useGameStore.getState().collectMagicalDiya('magical_diya_entrance', 'Diya of Auspicious Beginnings');
    expect(success).toBe(true);

    const state = useGameStore.getState();
    expect(state.quest.collectedDiyas).toEqual(['magical_diya_entrance']);
    expect(state.quest.isCompleted).toBe(false);
    expect(state.stats.magicalDiyasCollected).toBe(1);
    expect(state.questNotification).not.toBeNull();
    expect(state.questNotification?.type).toBe('collected');
    expect(state.questNotification?.message).toContain('1/5');
  });

  it('prevents duplicate collection of the same magical diya', () => {
    // First collection
    const firstTry = useGameStore.getState().collectMagicalDiya('magical_diya_plaza');
    expect(firstTry).toBe(true);
    expect(useGameStore.getState().quest.collectedDiyas).toHaveLength(1);

    // Second collection of same diya ID
    const secondTry = useGameStore.getState().collectMagicalDiya('magical_diya_plaza');
    expect(secondTry).toBe(false);
    expect(useGameStore.getState().quest.collectedDiyas).toHaveLength(1);
    expect(useGameStore.getState().stats.magicalDiyasCollected).toBe(1);
  });

  it('completes the quest and awards 50 tokens when all 5 diyas are collected', () => {
    const initialTokens = useGameStore.getState().tokens; // 50
    const diyaIds = [
      'magical_diya_entrance',
      'magical_diya_plaza',
      'magical_diya_sweets',
      'magical_diya_wheel',
      'magical_diya_stage',
    ];

    // Collect first 4
    for (let i = 0; i < 4; i++) {
      useGameStore.getState().collectMagicalDiya(diyaIds[i]);
      expect(useGameStore.getState().quest.isCompleted).toBe(false);
      expect(useGameStore.getState().tokens).toBe(initialTokens); // No completion reward yet
    }

    // Collect 5th diya
    const fifthCollected = useGameStore.getState().collectMagicalDiya(diyaIds[4]);
    expect(fifthCollected).toBe(true);

    const state = useGameStore.getState();
    expect(state.quest.collectedDiyas).toHaveLength(5);
    expect(state.quest.isCompleted).toBe(true);
    expect(state.stats.questCompleted).toBe(true);
    expect(state.stats.magicalDiyasCollected).toBe(5);

    // +50 Tokens reward granted!
    expect(state.tokens).toBe(initialTokens + 50);
    expect(state.questNotification?.type).toBe('completed');
    expect(state.questNotification?.title).toContain('Quest Complete');
  });

  it('guarantees reward-once behavior (never rewards completion bonus twice)', () => {
    const diyaIds = [
      'magical_diya_entrance',
      'magical_diya_plaza',
      'magical_diya_sweets',
      'magical_diya_wheel',
      'magical_diya_stage',
    ];

    // Collect all 5
    diyaIds.forEach((id) => useGameStore.getState().collectMagicalDiya(id));
    expect(useGameStore.getState().tokens).toBe(100); // 50 + 50

    // Try collecting an already-collected diya again
    const extraAttempt = useGameStore.getState().collectMagicalDiya('magical_diya_stage');
    expect(extraAttempt).toBe(false);
    expect(useGameStore.getState().tokens).toBe(100); // Tokens remain 100
  });

  it('persists quest progress and completion across save and load cycles', async () => {
    const customSave: SaveDataV1 = {
      ...DEFAULT_SAVE_DATA,
      tokens: 150,
      quest: {
        collectedDiyas: ['magical_diya_entrance', 'magical_diya_plaza'],
        isCompleted: false,
      },
      stats: {
        ...DEFAULT_SAVE_DATA.stats,
        magicalDiyasCollected: 2,
        questCompleted: false,
      },
    };

    const saved = await repo.save(customSave);
    expect(saved).toBe(true);

    const loaded = await repo.load();
    expect(loaded.quest?.collectedDiyas).toEqual(['magical_diya_entrance', 'magical_diya_plaza']);
    expect(loaded.quest?.isCompleted).toBe(false);
    expect(loaded.stats.magicalDiyasCollected).toBe(2);
  });

  it('gracefully handles legacy save data lacking quest fields without data loss', async () => {
    // Old format save without quest property
    const legacySave = {
      version: 1,
      tokens: 75,
      inventory: { items: { 'gulab_jamun': 2 } },
      litDiyas: ['diya_1'],
      stats: {
        balloonHighScore: 40,
        ringTossHighScore: 0,
        diyasLitCount: 1,
        rangoliCompleted: false,
        totalTokensEarned: 75,
        fireworksWatchedCount: 0,
      },
      settings: DEFAULT_SAVE_DATA.settings,
      lastSavedAt: Date.now(),
    };

    mockStorage['diwali_mela_save_v1'] = JSON.stringify(legacySave);

    const loaded = await repo.load();
    expect(loaded.version).toBe(1);
    expect(loaded.tokens).toBe(75);
    expect(loaded.quest).toBeDefined();
    expect(loaded.quest?.collectedDiyas).toEqual([]);
    expect(loaded.quest?.isCompleted).toBe(false);
  });

  it('safely scrubs malformed or duplicated quest data in localStorage', async () => {
    const malformedSave = {
      version: 1,
      tokens: 80,
      inventory: { items: {} },
      litDiyas: [],
      stats: {},
      quest: {
        collectedDiyas: ['magical_diya_1', 'magical_diya_1', 12345, null], // duplicates and invalid types
        isCompleted: 'yes', // non-boolean
      },
      settings: DEFAULT_SAVE_DATA.settings,
    };

    mockStorage['diwali_mela_save_v1'] = JSON.stringify(malformedSave);

    const loaded = await repo.load();
    expect(loaded.quest?.collectedDiyas).toEqual(['magical_diya_1']);
    expect(loaded.quest?.isCompleted).toBe(true); // coerced cleanly to boolean
  });

  it('allows dismissing quest notifications', () => {
    useGameStore.getState().collectMagicalDiya('magical_diya_entrance');
    expect(useGameStore.getState().questNotification).not.toBeNull();

    useGameStore.getState().dismissQuestNotification();
    expect(useGameStore.getState().questNotification).toBeNull();
  });
});
