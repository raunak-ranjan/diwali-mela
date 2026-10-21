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
});
