import { describe, it, expect, beforeEach } from 'vitest';
import {
  useGameStore,
  MAX_RING_TOSS_RINGS,
  RING_TOSS_TIME_LIMIT,
  calculateRingTossReward,
} from '../stores/useGameStore';

describe('Ring Toss Carnival Mini-Game Mechanics & Safety', () => {
  beforeEach(() => {
    // Reset game store state
    useGameStore.setState({
      tokens: 100,
      activeModal: 'none',
      inventory: {
        'gulab_jamun': 2,
        'earthen_diya': 5,
      },
      stats: {
        balloonHighScore: 40,
        ringTossHighScore: 0,
        diyasLitCount: 1,
        rangoliCompleted: false,
        totalTokensEarned: 100,
        fireworksWatchedCount: 0,
        shrineOfferingsCount: 0,
      },
      ringTossGame: {
        score: 0,
        ringsRemaining: MAX_RING_TOSS_RINGS,
        timeLeft: RING_TOSS_TIME_LIMIT,
        isPlaying: false,
        highScore: 0,
        hitsCount: 0,
      },
      balloonGame: {
        score: 0,
        timeLeft: 30,
        isPlaying: false,
        highScore: 40,
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
      tokenHistory: [],
      recentTokenDelta: null,
    });
  });

  it('initializes round state correctly on startRingTossGame', () => {
    useGameStore.getState().startRingTossGame();
    const state = useGameStore.getState();

    expect(state.activeModal).toBe('ring_toss');
    expect(state.ringTossGame.isPlaying).toBe(true);
    expect(state.ringTossGame.score).toBe(0);
    expect(state.ringTossGame.ringsRemaining).toBe(5);
    expect(state.ringTossGame.timeLeft).toBe(30);
    expect(state.ringTossGame.hitsCount).toBe(0);
  });

  it('correctly scores ring hits and decrements remaining rings', () => {
    useGameStore.getState().startRingTossGame();

    // Throw 1: hit on front bottle (10 pts)
    useGameStore.getState().recordRingTossThrow(10, true);
    let game = useGameStore.getState().ringTossGame;
    expect(game.ringsRemaining).toBe(4);
    expect(game.score).toBe(10);
    expect(game.hitsCount).toBe(1);

    // Throw 2: hit on middle pot (15 pts)
    useGameStore.getState().recordRingTossThrow(15, true);
    game = useGameStore.getState().ringTossGame;
    expect(game.ringsRemaining).toBe(3);
    expect(game.score).toBe(25);
    expect(game.hitsCount).toBe(2);

    // Throw 3: hit on back kalash (25 pts)
    useGameStore.getState().recordRingTossThrow(25, true);
    game = useGameStore.getState().ringTossGame;
    expect(game.ringsRemaining).toBe(2);
    expect(game.score).toBe(50);
    expect(game.hitsCount).toBe(3);
  });

  it('handles miss throws by decrementing rings without awarding score', () => {
    useGameStore.getState().startRingTossGame();

    // Throw 1: hit
    useGameStore.getState().recordRingTossThrow(10, true);
    expect(useGameStore.getState().ringTossGame.score).toBe(10);
    expect(useGameStore.getState().ringTossGame.ringsRemaining).toBe(4);

    // Throw 2: miss
    useGameStore.getState().recordRingTossThrow(0, false);
    expect(useGameStore.getState().ringTossGame.score).toBe(10);
    expect(useGameStore.getState().ringTossGame.ringsRemaining).toBe(3);
    expect(useGameStore.getState().ringTossGame.hitsCount).toBe(1);
  });

  it('automatically finishes the round when the 5th ring is thrown', () => {
    useGameStore.getState().startRingTossGame();

    // 5 throws
    useGameStore.getState().recordRingTossThrow(10, true);
    useGameStore.getState().recordRingTossThrow(15, true);
    useGameStore.getState().recordRingTossThrow(0, false);
    useGameStore.getState().recordRingTossThrow(15, true);
    useGameStore.getState().recordRingTossThrow(25, true);

    const state = useGameStore.getState();
    expect(state.ringTossGame.ringsRemaining).toBe(0);
    expect(state.ringTossGame.isPlaying).toBe(false); // Automatically completed
    expect(state.ringTossGame.score).toBe(65);
    expect(state.ringTossGame.hitsCount).toBe(4);

    // Tokens awarded based on formula: floor(65 / 3) = 21 tokens
    expect(state.tokens).toBe(100 + 21);
    expect(state.stats.ringTossHighScore).toBe(65);
    expect(state.stats.totalTokensEarned).toBe(100 + 21);
  });

  it('automatically finishes the round when timer expires', () => {
    useGameStore.getState().startRingTossGame();
    useGameStore.getState().recordRingTossThrow(15, true);

    // Set timeLeft to 1
    useGameStore.setState({
      ringTossGame: {
        ...useGameStore.getState().ringTossGame,
        timeLeft: 1,
      },
    });

    // Tick down to 0
    useGameStore.getState().tickRingTossGame();

    const state = useGameStore.getState();
    expect(state.ringTossGame.isPlaying).toBe(false);
    // Score of 15 gives min(25, max(5, floor(15 / 3))) = 5 tokens
    expect(state.tokens).toBe(105);
  });

  it('calculates rewards accurately according to formula and strictly caps at 25', () => {
    expect(calculateRingTossReward(0)).toBe(0);
    expect(calculateRingTossReward(-10)).toBe(0);
    expect(calculateRingTossReward(10)).toBe(5); // floor(10/3) = 3 -> min 5
    expect(calculateRingTossReward(30)).toBe(10); // floor(30/3) = 10
    expect(calculateRingTossReward(60)).toBe(20); // floor(60/3) = 20
    expect(calculateRingTossReward(75)).toBe(25); // floor(75/3) = 25
    expect(calculateRingTossReward(150)).toBe(25); // capped at 25
  });

  it('grants zero tokens when score is 0', () => {
    useGameStore.getState().startRingTossGame();

    // 5 misses
    for (let i = 0; i < 5; i++) {
      useGameStore.getState().recordRingTossThrow(0, false);
    }

    const state = useGameStore.getState();
    expect(state.ringTossGame.score).toBe(0);
    expect(state.ringTossGame.isPlaying).toBe(false);
    // Exactly 0 tokens awarded!
    expect(state.tokens).toBe(100);
    expect(state.stats.totalTokensEarned).toBe(100);
    expect(state.tokenHistory.length).toBe(0);
  });

  it('cancels the round cleanly without awarding tokens', () => {
    useGameStore.getState().startRingTossGame();
    useGameStore.getState().recordRingTossThrow(25, true);

    // Cancel mid-round
    useGameStore.getState().cancelRingTossGame();

    const state = useGameStore.getState();
    expect(state.activeModal).toBe('none');
    expect(state.ringTossGame.isPlaying).toBe(false);
    expect(state.tokens).toBe(100); // Strict zero token addition
    expect(state.stats.totalTokensEarned).toBe(100);
  });

  it('closing the modal via closeModal cancels playing round without tokens', () => {
    useGameStore.getState().startRingTossGame();
    useGameStore.getState().recordRingTossThrow(25, true);

    // Close modal directly
    useGameStore.getState().closeModal();

    const state = useGameStore.getState();
    expect(state.activeModal).toBe('none');
    expect(state.ringTossGame.isPlaying).toBe(false);
    expect(state.tokens).toBe(100);
  });

  it('guards against duplicate completion events and double token rewards', () => {
    useGameStore.getState().startRingTossGame();
    useGameStore.getState().recordRingTossThrow(25, true);
    useGameStore.getState().endRingTossGame();

    const tokensAfterFirstEnd = useGameStore.getState().tokens;
    expect(tokensAfterFirstEnd).toBe(108); // 100 + floor(25/3)=8

    // Attempting a second endRingTossGame on the same inactive round
    useGameStore.getState().endRingTossGame();
    expect(useGameStore.getState().tokens).toBe(tokensAfterFirstEnd);

    // Attempting a third time
    useGameStore.getState().endRingTossGame();
    expect(useGameStore.getState().tokens).toBe(tokensAfterFirstEnd);
  });

  it('rejects throws when game is not playing or rings are exhausted', () => {
    // Round not started
    useGameStore.getState().recordRingTossThrow(25, true);
    expect(useGameStore.getState().ringTossGame.score).toBe(0);

    // Start round and exhaust rings
    useGameStore.getState().startRingTossGame();
    for (let i = 0; i < 5; i++) {
      useGameStore.getState().recordRingTossThrow(10, true);
    }
    expect(useGameStore.getState().ringTossGame.ringsRemaining).toBe(0);
    const scoreAtEnd = useGameStore.getState().ringTossGame.score;

    // 6th throw must be rejected
    useGameStore.getState().recordRingTossThrow(25, true);
    expect(useGameStore.getState().ringTossGame.score).toBe(scoreAtEnd);
  });

  it('leaves unrelated systems, inventory, and balloon stats unaffected', () => {
    useGameStore.getState().startRingTossGame();
    useGameStore.getState().recordRingTossThrow(25, true);
    useGameStore.getState().endRingTossGame();

    const state = useGameStore.getState();
    // Inventory intact
    expect(state.inventory['gulab_jamun']).toBe(2);
    expect(state.inventory['earthen_diya']).toBe(5);
    // Balloon shooting stats intact
    expect(state.stats.balloonHighScore).toBe(40);
    expect(state.balloonGame.highScore).toBe(40);
    // Quest state intact
    expect(state.quest.isCompleted).toBe(false);
    expect(state.stats.diyasLitCount).toBe(1);
  });
});
