import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from '../stores/useGameStore';

describe('useGameStore Game Mechanics & Rewards', () => {
  beforeEach(() => {
    // Mock localStorage
    const mockStorage: Record<string, string> = {};
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, val: string) => {
        mockStorage[key] = val;
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
    });

    // Reset store state
    useGameStore.setState({
      tokens: 50,
      inventory: { 'gulab_jamun': 1 },
      litDiyas: [],
      activeModal: 'welcome',
      balloonGame: {
        score: 0,
        timeLeft: 30,
        isPlaying: false,
        highScore: 0,
      },
    });
  });

  it('awards virtual tokens correctly upon addTokens', () => {
    useGameStore.getState().addTokens(20);
    expect(useGameStore.getState().tokens).toBe(70);
  });

  it('handles virtual shop purchases when tokens are sufficient', () => {
    // Gulab jamun costs 15 tokens
    const success = useGameStore.getState().purchaseItem('gulab_jamun');
    expect(success).toBe(true);
    expect(useGameStore.getState().tokens).toBe(35); // 50 - 15
    expect(useGameStore.getState().inventory['gulab_jamun']).toBe(2);
  });

  it('rejects shop purchase when tokens are insufficient', () => {
    useGameStore.setState({ tokens: 5 });
    const success = useGameStore.getState().purchaseItem('kandil_lantern'); // costs 40
    expect(success).toBe(false);
    expect(useGameStore.getState().tokens).toBe(5);
  });

  it('rewards virtual tokens when lighting a diya', () => {
    const initialLit = useGameStore.getState().litDiyas.length;
    useGameStore.getState().lightDiya('diya_test_1');

    expect(useGameStore.getState().litDiyas).toContain('diya_test_1');
    expect(useGameStore.getState().litDiyas.length).toBe(initialLit + 1);
    expect(useGameStore.getState().tokens).toBe(55); // 50 + 5 reward

    // Lighting same diya again does not grant duplicate tokens
    useGameStore.getState().lightDiya('diya_test_1');
    expect(useGameStore.getState().tokens).toBe(55);
  });

  it('scores and awards tokens in balloon shooting mini-game', () => {
    useGameStore.getState().startBalloonGame();
    expect(useGameStore.getState().balloonGame.isPlaying).toBe(true);

    useGameStore.getState().recordBalloonHit(20);
    useGameStore.getState().recordBalloonHit(15);
    expect(useGameStore.getState().balloonGame.score).toBe(35);

    useGameStore.getState().endBalloonGame();
    expect(useGameStore.getState().balloonGame.isPlaying).toBe(false);
    // Reward is max(10, floor(score / 2)) -> floor(35 / 2) = 17 tokens
    expect(useGameStore.getState().tokens).toBe(50 + 17);
  });

  // --- Focused Save-System Regression Tests ---

  it('preserves unrelated statistics when earning or spending tokens', () => {
    // Seed store with high-value statistics
    useGameStore.setState({
      tokens: 100,
      stats: {
        balloonHighScore: 150,
        ringTossHighScore: 80,
        diyasLitCount: 4,
        rangoliCompleted: true,
        totalTokensEarned: 220,
        fireworksWatchedCount: 3,
      },
      litDiyas: ['diya_1', 'diya_2', 'diya_3', 'diya_4'],
      inventory: { 'gulab_jamun': 1 },
    });

    // 1. Purchase an item (costs 15 tokens)
    const bought = useGameStore.getState().purchaseItem('gulab_jamun');
    expect(bought).toBe(true);
    expect(useGameStore.getState().tokens).toBe(85);

    // Unrelated statistics MUST remain intact
    let currentStats = useGameStore.getState().stats;
    expect(currentStats.rangoliCompleted).toBe(true);
    expect(currentStats.fireworksWatchedCount).toBe(3);
    expect(currentStats.balloonHighScore).toBe(150);
    expect(currentStats.ringTossHighScore).toBe(80);
    expect(currentStats.diyasLitCount).toBe(4);

    // 2. Add tokens
    useGameStore.getState().addTokens(20);
    expect(useGameStore.getState().tokens).toBe(105);

    currentStats = useGameStore.getState().stats;
    expect(currentStats.rangoliCompleted).toBe(true);
    expect(currentStats.fireworksWatchedCount).toBe(3);
    expect(currentStats.balloonHighScore).toBe(150);
    expect(currentStats.ringTossHighScore).toBe(80);
  });

  it('correctly tracks lifetime token earnings (totalTokensEarned) versus current spendable balance', () => {
    // Start at initial default: 50 current tokens, 50 lifetime tokens earned
    useGameStore.setState({
      tokens: 50,
      stats: {
        balloonHighScore: 0,
        ringTossHighScore: 0,
        diyasLitCount: 0,
        rangoliCompleted: false,
        totalTokensEarned: 50,
        fireworksWatchedCount: 0,
      },
    });

    // Earn 30 tokens from activity
    useGameStore.getState().addTokens(30);
    expect(useGameStore.getState().tokens).toBe(80);
    expect(useGameStore.getState().stats.totalTokensEarned).toBe(80);

    // Spend 25 tokens on Silver Foil Kaju Katli (price = 25)
    const bought = useGameStore.getState().purchaseItem('kaju_katli');
    expect(bought).toBe(true);
    // Current spendable balance drops: 80 - 25 = 55
    expect(useGameStore.getState().tokens).toBe(55);
    // LIFETIME EARNINGS MUST NOT DECREASE!
    expect(useGameStore.getState().stats.totalTokensEarned).toBe(80);

    // Earn 10 tokens from balloon game
    useGameStore.getState().startBalloonGame();
    useGameStore.getState().recordBalloonHit(20); // 20 score -> reward is 10 tokens
    useGameStore.getState().endBalloonGame();

    // Spendable balance: 55 + 10 = 65
    expect(useGameStore.getState().tokens).toBe(65);
    // Lifetime earnings: 80 + 10 = 90
    expect(useGameStore.getState().stats.totalTokensEarned).toBe(90);
  });

  it('grants diya reward exactly once even on rapid repeated activations', () => {
    useGameStore.setState({
      tokens: 50,
      litDiyas: [],
      stats: {
        balloonHighScore: 0,
        ringTossHighScore: 0,
        diyasLitCount: 0,
        rangoliCompleted: false,
        totalTokensEarned: 50,
        fireworksWatchedCount: 0,
      },
    });

    // First activation: awards 5 tokens
    useGameStore.getState().lightDiya('promenade_diya_1');
    expect(useGameStore.getState().tokens).toBe(55);
    expect(useGameStore.getState().stats.totalTokensEarned).toBe(55);
    expect(useGameStore.getState().stats.diyasLitCount).toBe(1);
    expect(useGameStore.getState().litDiyas).toEqual(['promenade_diya_1']);

    // Duplicate activations: must be no-op
    useGameStore.getState().lightDiya('promenade_diya_1');
    useGameStore.getState().lightDiya('promenade_diya_1');
    expect(useGameStore.getState().tokens).toBe(55);
    expect(useGameStore.getState().stats.totalTokensEarned).toBe(55);
    expect(useGameStore.getState().stats.diyasLitCount).toBe(1);
    expect(useGameStore.getState().litDiyas.length).toBe(1);
  });

  it('guards against duplicate mini-game completion events', () => {
    useGameStore.setState({
      tokens: 50,
      stats: {
        balloonHighScore: 0,
        ringTossHighScore: 50,
        diyasLitCount: 0,
        rangoliCompleted: false,
        totalTokensEarned: 50,
        fireworksWatchedCount: 0,
      },
    });

    useGameStore.getState().startBalloonGame();
    useGameStore.getState().recordBalloonHit(40); // 40 points -> reward = 20 tokens

    // First completion
    useGameStore.getState().endBalloonGame();
    expect(useGameStore.getState().tokens).toBe(70); // 50 + 20
    expect(useGameStore.getState().stats.balloonHighScore).toBe(40);
    expect(useGameStore.getState().stats.ringTossHighScore).toBe(50); // preserved

    // Accidental second invocation (duplicate event from async or multiple button clicks)
    useGameStore.getState().endBalloonGame();
    useGameStore.getState().endBalloonGame();

    // Tokens must NOT increase again!
    expect(useGameStore.getState().tokens).toBe(70);
    expect(useGameStore.getState().stats.totalTokensEarned).toBe(70);
  });

  it('survives full initializeSave cycle restoring player stats and settings', async () => {
    const mockSave = {
      version: 1,
      tokens: 125,
      inventory: { items: { 'gulab_jamun': 3, 'phooljhadi': 1 } },
      litDiyas: ['diya_west_1', 'diya_west_2'],
      stats: {
        balloonHighScore: 95,
        ringTossHighScore: 40,
        diyasLitCount: 2,
        rangoliCompleted: true,
        totalTokensEarned: 180,
        fireworksWatchedCount: 1,
      },
      settings: {
        graphicsQuality: 'medium' as const,
        masterVolume: 0.75,
        sfxVolume: 0.85,
        musicVolume: 0.65,
        touchSensitivity: 1.1,
        reducedMotion: true,
      },
      lastSavedAt: Date.now(),
    };

    // Stage in localStorage
    localStorage.setItem('diwali_mela_save_v1', JSON.stringify(mockSave));

    // Initialize from storage
    await useGameStore.getState().initializeSave();

    const state = useGameStore.getState();
    expect(state.isLoaded).toBe(true);
    expect(state.tokens).toBe(125);
    expect(state.inventory['gulab_jamun']).toBe(3);
    expect(state.inventory['phooljhadi']).toBe(1);
    expect(state.litDiyas).toEqual(['diya_west_1', 'diya_west_2']);
    expect(state.stats.balloonHighScore).toBe(95);
    expect(state.stats.ringTossHighScore).toBe(40);
    expect(state.stats.rangoliCompleted).toBe(true);
    expect(state.stats.totalTokensEarned).toBe(180);
    expect(state.stats.fireworksWatchedCount).toBe(1);
    expect(state.settings.reducedMotion).toBe(true);
    expect(state.settings.graphicsQuality).toBe('medium');
  });
});
