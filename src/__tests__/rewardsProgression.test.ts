import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from '../stores/useGameStore';
import { saveRepository, DEFAULT_SAVE_DATA } from '../systems/saveRepository';

describe('Milestone 2: Rewards, Wallet & Progression System', () => {
  let mockStorage: Record<string, string> = {};

  beforeEach(async () => {
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

    // Reset repository and in-memory store before each test
    await saveRepository.reset();
    useGameStore.setState({
      tokens: 50,
      litDiyas: [],
      inventory: { 'gulab_jamun': 1, 'earthen_diya': 5 },
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
      recentTokenDelta: null,
      activeModal: 'none',
    });
  });

  // 1. Wallet balance and reward history tracking
  it('tracks token balance and records income and expense transactions with metadata', () => {
    const store = useGameStore.getState();
    expect(store.tokens).toBe(50);
    expect(store.tokenHistory.length).toBe(1);

    // Earn tokens from lighting a diya
    store.lightDiya('diya_test_1');
    const afterLight = useGameStore.getState();
    expect(afterLight.tokens).toBe(55);
    expect(afterLight.tokenHistory.length).toBe(2);
    expect(afterLight.tokenHistory[1].amount).toBe(5);
    expect(afterLight.tokenHistory[1].source).toBe('Diya Kindled');
    expect(afterLight.recentTokenDelta?.amount).toBe(5);

    // Spend tokens at a sweet stall
    const bought = afterLight.purchaseItem('gulab_jamun'); // costs 15 tokens
    expect(bought).toBe(true);
    const afterBuy = useGameStore.getState();
    expect(afterBuy.tokens).toBe(40);
    expect(afterBuy.tokenHistory.length).toBe(3);
    expect(afterBuy.tokenHistory[2].amount).toBe(-15);
    expect(afterBuy.recentTokenDelta?.amount).toBe(-15);
  });

  // 2. One-time quest reward behavior
  it('awards 50 bonus tokens only once upon completing all 5 sacred diyas and records it in history', () => {
    const diyas = ['diya_1', 'diya_2', 'diya_3', 'diya_4', 'diya_5'];
    diyas.forEach((d) => useGameStore.getState().collectMagicalDiya(d));

    const state = useGameStore.getState();
    expect(state.quest.isCompleted).toBe(true);
    expect(state.tokens).toBe(100); // 50 initial + 50 quest reward
    expect(state.stats.totalTokensEarned).toBe(100);

    const questTx = state.tokenHistory.find((t) => t.source === 'Sacred Lights Quest Reward');
    expect(questTx).toBeDefined();
    expect(questTx?.amount).toBe(50);

    // Attempting to collect an already-kindled diya returns false and does not award extra tokens
    const duplicateCollect = useGameStore.getState().collectMagicalDiya('diya_1');
    expect(duplicateCollect).toBe(false);
    expect(useGameStore.getState().tokens).toBe(100);
  });

  // 3. Successful cosmetic purchase
  it('allows purchasing an affordable cosmetic, deducting tokens and adding to unlocked collection', () => {
    const store = useGameStore.getState();
    expect(store.tokens).toBe(50);

    // Swarna Aura costs 30 tokens
    const success = store.unlockCosmetic('swarna_aura');
    expect(success).toBe(true);

    const updated = useGameStore.getState();
    expect(updated.tokens).toBe(20); // 50 - 30
    expect(updated.cosmetics.unlocked).toContain('swarna_aura');
    expect(updated.cosmetics.equipped).toBe('swarna_aura'); // auto-equips when none equipped
    expect(updated.tokenHistory[updated.tokenHistory.length - 1].amount).toBe(-30);
    expect(updated.recentTokenDelta?.amount).toBe(-30);
  });

  // 4. Insufficient-balance rejection
  it('rejects cosmetic purchase when token balance is insufficient without deducting tokens', () => {
    useGameStore.setState({ tokens: 10 });
    // Surya Mukut costs 120 tokens
    const success = useGameStore.getState().unlockCosmetic('surya_mukut');
    expect(success).toBe(false);

    const state = useGameStore.getState();
    expect(state.tokens).toBe(10);
    expect(state.cosmetics.unlocked).not.toContain('surya_mukut');
  });

  // 5. Duplicate purchase prevention
  it('prevents purchasing an already-unlocked cosmetic again, protecting against double deductions', () => {
    useGameStore.getState().unlockCosmetic('swarna_aura'); // costs 30, leaves 20
    expect(useGameStore.getState().tokens).toBe(20);

    // Give player more tokens and try to purchase swarna_aura again
    useGameStore.getState().addTokens(100);
    expect(useGameStore.getState().tokens).toBe(120);

    const duplicatePurchase = useGameStore.getState().unlockCosmetic('swarna_aura');
    expect(duplicatePurchase).toBe(false);
    expect(useGameStore.getState().tokens).toBe(120); // balance untouched
  });

  // 6. Equip, switch, and unequip behavior
  it('allows equipping owned cosmetics, switching between them, and unequipping', () => {
    // Unlock two cosmetics
    useGameStore.setState({ tokens: 150 });
    useGameStore.getState().unlockCosmetic('swarna_aura');
    useGameStore.getState().unlockCosmetic('deepam_companion');

    expect(useGameStore.getState().cosmetics.unlocked).toEqual(['swarna_aura', 'deepam_companion']);

    // Switch equipped to deepam_companion
    const equipSuccess = useGameStore.getState().equipCosmetic('deepam_companion');
    expect(equipSuccess).toBe(true);
    expect(useGameStore.getState().cosmetics.equipped).toBe('deepam_companion');

    // Unequip
    useGameStore.getState().equipCosmetic(null);
    expect(useGameStore.getState().cosmetics.equipped).toBeNull();

    // Cannot equip unowned cosmetic
    const invalidEquip = useGameStore.getState().equipCosmetic('surya_mukut');
    expect(invalidEquip).toBe(false);
    expect(useGameStore.getState().cosmetics.equipped).toBeNull();
  });

  // 7. Save/load persistence
  it('persists unlocked and equipped cosmetics across save repository load', async () => {
    useGameStore.setState({ tokens: 100 });
    useGameStore.getState().unlockCosmetic('deepam_companion'); // costs 50, balance 50

    const loaded = await saveRepository.load();
    expect(loaded.tokens).toBe(50);
    expect(loaded.cosmetics?.unlocked).toContain('deepam_companion');
    expect(loaded.cosmetics?.equipped).toBe('deepam_companion');
  });

  // 8. Legacy-save migration
  it('sanitizes and migrates older saves without cosmetics or tokenHistory without losing user data', async () => {
    const legacySave = {
      version: 1,
      tokens: 75,
      inventory: { items: { 'gulab_jamun': 2 } },
      litDiyas: ['entrance_1'],
      stats: {
        balloonHighScore: 15,
        ringTossHighScore: 0,
        diyasLitCount: 1,
        rangoliCompleted: true,
        totalTokensEarned: 95,
        fireworksWatchedCount: 2,
      },
      settings: DEFAULT_SAVE_DATA.settings,
      lastSavedAt: Date.now(),
      // cosmetics and tokenHistory are omitted intentionally (legacy save)
    };

    localStorage.setItem('diwali_mela_save_v1', JSON.stringify(legacySave));

    const loaded = await saveRepository.load();
    expect(loaded.tokens).toBe(75);
    expect(loaded.cosmetics).toBeDefined();
    expect(loaded.cosmetics?.unlocked).toEqual([]);
    expect(loaded.cosmetics?.equipped).toBeNull();
    expect(loaded.tokenHistory).toBeDefined();
    expect(loaded.tokenHistory?.length).toBeGreaterThan(0);
    expect(loaded.tokenHistory?.[0].amount).toBe(75);
  });

  // 9. Corrupt or unknown cosmetic IDs
  it('filters out corrupt, malformed, or unknown cosmetic IDs during schema sanitization', async () => {
    const corruptSave = {
      version: 1,
      tokens: 80,
      inventory: { items: {} },
      litDiyas: [],
      stats: { ...DEFAULT_SAVE_DATA.stats, totalTokensEarned: 80 },
      settings: DEFAULT_SAVE_DATA.settings,
      cosmetics: {
        unlocked: ['swarna_aura', 'hacked_super_weapon', 12345, null],
        equipped: 'hacked_super_weapon', // unknown item cannot remain equipped
      },
      lastSavedAt: Date.now(),
    };

    localStorage.setItem('diwali_mela_save_v1', JSON.stringify(corruptSave));

    const loaded = await saveRepository.load();
    expect(loaded.cosmetics?.unlocked).toEqual(['swarna_aura']);
    expect(loaded.cosmetics?.equipped).toBeNull(); // sanitized to null
  });

  // 10. Achievement accuracy and repeated interactions
  it('authoritatively maintains stats without counting repeated diya lights or invalid interactions', () => {
    const store = useGameStore.getState();

    // Lighting same diya multiple times
    store.lightDiya('diya_plaza_north');
    expect(useGameStore.getState().stats.diyasLitCount).toBe(1);
    expect(useGameStore.getState().tokens).toBe(55);

    store.lightDiya('diya_plaza_north'); // repeat
    expect(useGameStore.getState().stats.diyasLitCount).toBe(1);
    expect(useGameStore.getState().tokens).toBe(55); // no duplicate tokens

    // Rangoli completion is recorded once
    store.completeRangoli();
    expect(useGameStore.getState().stats.rangoliCompleted).toBe(true);
    expect(useGameStore.getState().tokens).toBe(80); // 55 + 25

    store.completeRangoli(); // repeat
    expect(useGameStore.getState().tokens).toBe(80); // no duplicate reward
  });
});
