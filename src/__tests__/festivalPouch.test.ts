import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useGameStore, SHOP_CATALOG } from '../stores/useGameStore';
import { saveRepository } from '../systems/saveRepository';
import { getCalendarDateString } from '../types/daily';

describe('Festival Pouch & Interactive Inventory Mechanics', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-22T12:00:00Z'));

    // Mock storage
    const mockStorage: Record<string, string> = {};
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, val: string) => {
        mockStorage[key] = val;
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
      clear: () => {
        for (const k in mockStorage) delete mockStorage[k];
      },
    });

    // Reset game store state
    useGameStore.setState({
      tokens: 100,
      inventory: {
        'gulab_jamun': 2,
        'kaju_katli': 1,
        'earthen_diya': 3,
        'phooljhadi': 1,
        'kandil_lantern': 1,
      },
      sparklerActiveUntil: null,
      stats: {
        balloonHighScore: 0,
        ringTossHighScore: 0,
        diyasLitCount: 0,
        rangoliCompleted: false,
        totalTokensEarned: 100,
        fireworksWatchedCount: 0,
        shrineOfferingsCount: 0,
      },
      dailyDarshan: {
        date: getCalendarDateString(),
        challenges: [
          {
            id: 'c_taste_sweet_1',
            type: 'taste_sweet',
            title: 'Taste Sweets',
            hindiTitle: 'मिठाई',
            description: 'Taste 1 traditional sweet',
            target: 1,
            current: 0,
            isCompleted: false,
            icon: '🍯',
          },
          {
            id: 'c_visit_attraction_1',
            type: 'visit_attraction',
            title: 'Mela Sightseer',
            hindiTitle: 'मेला भ्रमण',
            description: 'Ride Ferris Wheel',
            target: 1,
            current: 0,
            isCompleted: false,
            icon: '🎡',
          },
        ],
        isAllCompleted: false,
        isClaimed: false,
        streak: 1,
        lastCompletedDate: null,
        claimedDates: [],
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('deducts exactly one sweet when consuming valid owned mithai', () => {
    const initialCount = useGameStore.getState().inventory['gulab_jamun'];
    expect(initialCount).toBe(2);

    const result = useGameStore.getState().consumeInventoryItem('gulab_jamun');
    expect(result.success).toBe(true);
    expect(result.message).toContain('Gulab Jamun');

    const updatedCount = useGameStore.getState().inventory['gulab_jamun'];
    expect(updatedCount).toBe(1);
    // Token balance is strictly unaffected (no free tokens for eating)
    expect(useGameStore.getState().tokens).toBe(100);
  });

  it('rejects consuming item with zero quantity', () => {
    // jalebi is not in starting inventory (quantity 0)
    const result = useGameStore.getState().consumeInventoryItem('jalebi');
    expect(result.success).toBe(false);
    expect(result.message).toContain("don't have any");
    expect(useGameStore.getState().inventory['jalebi'] || 0).toBe(0);
  });

  it('rejects consuming invalid or unknown item IDs', () => {
    const result = useGameStore.getState().consumeInventoryItem('phantom_sweet_xyz');
    expect(result.success).toBe(false);
    expect(result.message).toContain('Only festival sweets can be consumed');
  });

  it('rejects consuming non-sweet items directly via sweet action', () => {
    const result = useGameStore.getState().consumeInventoryItem('phooljhadi');
    expect(result.success).toBe(false);
    expect(result.message).toContain('Only festival sweets can be consumed');
    expect(useGameStore.getState().inventory['phooljhadi']).toBe(1);
  });

  it('cannot drop inventory below zero even with repeated consumption attempts', () => {
    // Player has 1 kaju_katli
    const r1 = useGameStore.getState().consumeInventoryItem('kaju_katli');
    expect(r1.success).toBe(true);
    expect(useGameStore.getState().inventory['kaju_katli']).toBe(0);

    // Second attempt must fail
    const r2 = useGameStore.getState().consumeInventoryItem('kaju_katli');
    expect(r2.success).toBe(false);
    expect(useGameStore.getState().inventory['kaju_katli']).toBe(0);

    // Third attempt must fail
    const r3 = useGameStore.getState().consumeInventoryItem('kaju_katli');
    expect(r3.success).toBe(false);
    expect(useGameStore.getState().inventory['kaju_katli']).toBe(0);
  });

  it('advances matching daily challenge only through valid sweet tasting', () => {
    const sweetBefore = useGameStore.getState().dailyDarshan.challenges.find((c) => c.type === 'taste_sweet');
    const otherBefore = useGameStore.getState().dailyDarshan.challenges.find((c) => c.type === 'visit_attraction');
    expect(sweetBefore).toBeDefined();
    expect(sweetBefore!.current).toBe(0);
    expect(sweetBefore!.isCompleted).toBe(false);
    expect(otherBefore).toBeDefined();
    expect(otherBefore!.current).toBe(0);
    expect(otherBefore!.isCompleted).toBe(false);

    // Consume 1 sweet
    const result = useGameStore.getState().consumeInventoryItem('gulab_jamun');
    expect(result.success).toBe(true);

    const sweetAfter = useGameStore.getState().dailyDarshan.challenges.find((c) => c.type === 'taste_sweet');
    const otherAfter = useGameStore.getState().dailyDarshan.challenges.find((c) => c.type === 'visit_attraction');
    expect(sweetAfter).toBeDefined();
    expect(sweetAfter!.current).toBe(1);
    expect(sweetAfter!.isCompleted).toBe(true);

    // Verify unrelated challenge is not advanced
    expect(otherAfter).toBeDefined();
    expect(otherAfter!.current).toBe(0);
    expect(otherAfter!.isCompleted).toBe(false);
  });

  it('handles phooljhadi sparkler activation, timer, and duplicate protection', () => {
    expect(useGameStore.getState().inventory['phooljhadi']).toBe(1);
    expect(useGameStore.getState().sparklerActiveUntil).toBeNull();

    // 1. Activate sparkler
    const r1 = useGameStore.getState().lightSparkler();
    expect(r1.success).toBe(true);
    expect(r1.message).toContain('Sparkler ignited');
    expect(useGameStore.getState().inventory['phooljhadi']).toBe(0);
    expect(useGameStore.getState().sparklerActiveUntil).toBeGreaterThan(Date.now());

    // 2. Reject activating a second sparkler while active
    const r2 = useGameStore.getState().lightSparkler();
    expect(r2.success).toBe(false);
    // Still 0 inventory
    expect(useGameStore.getState().inventory['phooljhadi']).toBe(0);

    // 3. Stop sparkler cleans up state cleanly
    useGameStore.getState().stopSparkler();
    expect(useGameStore.getState().sparklerActiveUntil).toBeNull();
  });

  it('handles clay diya offering, deduplication, and legacy earthen_diya safety', () => {
    // Starting with earthen_diya: 3, clay_diyas_set: undefined
    expect(useGameStore.getState().inventory['earthen_diya']).toBe(3);
    const initialOfferings = useGameStore.getState().stats.shrineOfferingsCount || 0;
    const initialDiyasLit = useGameStore.getState().stats.diyasLitCount;

    // 1. Offer diya at shrine
    const r1 = useGameStore.getState().offerDiyaToShrine();
    expect(r1.success).toBe(true);
    expect(r1.message).toContain('Akhand Jyoti');
    // Deducted from legacy earthen_diya without deleting key
    expect(useGameStore.getState().inventory['earthen_diya']).toBe(2);
    // shrineOfferingsCount incremented, normal world diyasLitCount NOT falsely inflated
    expect(useGameStore.getState().stats.shrineOfferingsCount).toBe(initialOfferings + 1);
    expect(useGameStore.getState().stats.diyasLitCount).toBe(initialDiyasLit);
    // Tokens strictly not awarded (no loop exploit)
    expect(useGameStore.getState().tokens).toBe(100);
  });

  it('allows offering modern clay_diyas_set when earthen_diya is exhausted', () => {
    useGameStore.setState({
      inventory: {
        'earthen_diya': 0,
        'clay_diyas_set': 1,
      },
    });

    const result = useGameStore.getState().offerDiyaToShrine();
    expect(result.success).toBe(true);
    expect(useGameStore.getState().inventory['clay_diyas_set']).toBe(0);
  });

  it('rejects diya offering when player has neither clay_diyas_set nor earthen_diya', () => {
    useGameStore.setState({
      inventory: {
        'earthen_diya': 0,
        'clay_diyas_set': 0,
      },
    });

    const result = useGameStore.getState().offerDiyaToShrine();
    expect(result.success).toBe(false);
    expect(result.message).toContain('no handcrafted clay diyas');
  });

  it('verifies keepsake inspection does not consume the item or alter tokens', () => {
    expect(useGameStore.getState().inventory['kandil_lantern']).toBe(1);
    const item = SHOP_CATALOG.find((i) => i.id === 'kandil_lantern');
    expect(item).toBeDefined();
    expect(item?.category).toBe('handicraft');

    // Attempting to consume keepsake fails safely
    const result = useGameStore.getState().consumeInventoryItem('kandil_lantern');
    expect(result.success).toBe(false);
    expect(useGameStore.getState().inventory['kandil_lantern']).toBe(1);
  });

  it('preserves consumed zero quantities through save/load cycle without re-populating defaults', async () => {
    // Consume gulab_jamun to 0
    useGameStore.setState({
      tokens: 75,
      inventory: {
        'gulab_jamun': 0,
        'earthen_diya': 5,
      },
    });

    // Save state
    await saveRepository.save({
      version: 1,
      tokens: 75,
      inventory: {
        items: {
          'gulab_jamun': 0,
          'earthen_diya': 5,
        },
      },
      litDiyas: [],
      stats: {
        balloonHighScore: 0,
        ringTossHighScore: 0,
        diyasLitCount: 0,
        rangoliCompleted: false,
        totalTokensEarned: 75,
        fireworksWatchedCount: 0,
        shrineOfferingsCount: 1,
      },
      settings: {
        graphicsQuality: 'high',
        masterVolume: 0.8,
        sfxVolume: 0.8,
        musicVolume: 0.5,
        touchSensitivity: 1.0,
        reducedMotion: false,
      },
      lastSavedAt: Date.now(),
    });

    // Clear store state to default
    useGameStore.setState({
      isLoaded: false,
      inventory: {},
    });

    // Initialize from save
    await useGameStore.getState().initializeSave();

    const loadedInventory = useGameStore.getState().inventory;
    // gulab_jamun must remain 0 and not be reset to 1 by defaultSave!
    expect(loadedInventory['gulab_jamun']).toBe(0);
    expect(loadedInventory['earthen_diya']).toBe(5);
    expect(useGameStore.getState().stats.shrineOfferingsCount).toBe(1);
  });
});
