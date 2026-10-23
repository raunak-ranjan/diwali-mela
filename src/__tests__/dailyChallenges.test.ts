import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from '../stores/useGameStore';
import { saveRepository, DEFAULT_SAVE_DATA } from '../systems/saveRepository';
import {
  hashDateString,
  generateDailyChallenges,
  isConsecutiveDay,
  DAILY_BONUS_TOKENS,
  CHALLENGE_TEMPLATES,
  getCalendarDateString,
} from '../types/daily';

describe('Milestone 2: Festival Darshan Daily Challenges', () => {
  let mockStorage: Record<string, string> = {};

  beforeEach(async () => {
    vi.restoreAllMocks();
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
    await useGameStore.getState().resetProgress();
  });

  // 1. Deterministic daily challenge selection
  it('deterministically generates identical 3 challenges for a given date across independent runs', () => {
    const dateA = '2026-10-22';
    const run1 = generateDailyChallenges(dateA);
    const run2 = generateDailyChallenges(dateA);

    expect(run1).toHaveLength(3);
    expect(run2).toHaveLength(3);
    expect(run1.map((c) => c.id)).toEqual(run2.map((c) => c.id));
    expect(run1.map((c) => c.type)).toEqual(run2.map((c) => c.type));

    // Ensure all 3 are distinct
    const uniqueIds = new Set(run1.map((c) => c.id));
    expect(uniqueIds.size).toBe(3);
  });

  it('generates different or rotated challenges for different dates', () => {
    const day1 = generateDailyChallenges('2026-10-21');
    const day2 = generateDailyChallenges('2026-10-22');
    const day3 = generateDailyChallenges('2026-10-23');

    // Hashing produces distinct seeds
    expect(hashDateString('2026-10-21')).not.toBe(hashDateString('2026-10-22'));
    expect(hashDateString('2026-10-22')).not.toBe(hashDateString('2026-10-23'));

    // Check that challenge structures are valid against template pool
    for (const ch of [...day1, ...day2, ...day3]) {
      const template = CHALLENGE_TEMPLATES.find((t) => t.id === ch.id);
      expect(template).toBeDefined();
      expect(ch.target).toBe(template!.target);
      expect(ch.current).toBe(0);
      expect(ch.isCompleted).toBe(false);
    }
  });

  // 2. Calendar rollover and date refresh
  it('correctly detects consecutive and non-consecutive days', () => {
    expect(isConsecutiveDay('2026-10-21', '2026-10-22')).toBe(true);
    expect(isConsecutiveDay('2026-10-22', '2026-10-23')).toBe(true);
    expect(isConsecutiveDay('2026-10-31', '2026-11-01')).toBe(true); // month rollover
    expect(isConsecutiveDay('2026-12-31', '2027-01-01')).toBe(true); // year rollover

    expect(isConsecutiveDay('2026-10-21', '2026-10-23')).toBe(false); // skipped day
    expect(isConsecutiveDay('2026-10-22', '2026-10-22')).toBe(false); // same day
    expect(isConsecutiveDay('2026-10-23', '2026-10-22')).toBe(false); // backwards clock
    expect(isConsecutiveDay('', '2026-10-22')).toBe(false);
    expect(isConsecutiveDay('invalid-date', '2026-10-22')).toBe(false);
  });

  it('rolls over cleanly when date changes and resets challenge progress', () => {
    const store = useGameStore.getState();
    store.refreshDailyDarshan('2026-10-22');

    const state1 = useGameStore.getState().dailyDarshan;
    expect(state1.date).toBe('2026-10-22');

    // Make progress on day 1
    useGameStore.getState().lightDiya('test_diya_1');

    // Simulate next day rollover
    useGameStore.getState().refreshDailyDarshan('2026-10-23');
    const state2 = useGameStore.getState().dailyDarshan;
    expect(state2.date).toBe('2026-10-23');
    expect(state2.challenges.every((c) => c.current === 0)).toBe(true);
    expect(state2.isAllCompleted).toBe(false);
    expect(state2.isClaimed).toBe(false);
  });

  // 3. Objective completion conditions & idempotency
  it('updates diya lighting challenge progress idempotently and clamps at target', () => {
    // Manually set dailyDarshan to a known challenge set containing 'light_diyas'
    const store = useGameStore.getState();
    const targetChallenge = {
      id: 'ch_light_diyas',
      type: 'light_diyas' as const,
      title: 'Deepam Seva',
      hindiTitle: 'दीपक सेवा',
      description: 'Kindle 3 earthen diyas',
      target: 3,
      current: 0,
      isCompleted: false,
      icon: '🪔',
    };

    useGameStore.setState({
      dailyDarshan: {
        ...store.dailyDarshan,
        challenges: [targetChallenge],
        isAllCompleted: false,
      },
    });

    // Light 1st diya
    useGameStore.getState().lightDiya('lane_diya_1');
    expect(useGameStore.getState().dailyDarshan.challenges[0].current).toBe(1);
    expect(useGameStore.getState().dailyDarshan.challenges[0].isCompleted).toBe(false);

    // Duplicate light of same diya does not overcount
    useGameStore.getState().lightDiya('lane_diya_1');
    expect(useGameStore.getState().dailyDarshan.challenges[0].current).toBe(1);

    // Light 2nd and 3rd diyas
    useGameStore.getState().lightDiya('lane_diya_2');
    useGameStore.getState().lightDiya('lane_diya_3');
    expect(useGameStore.getState().dailyDarshan.challenges[0].current).toBe(3);
    expect(useGameStore.getState().dailyDarshan.challenges[0].isCompleted).toBe(true);

    // 4th diya does not exceed target
    useGameStore.getState().lightDiya('lane_diya_4');
    expect(useGameStore.getState().dailyDarshan.challenges[0].current).toBe(3);
  });

  it('updates balloon shooting score and hit challenges correctly', () => {
    useGameStore.setState({
      dailyDarshan: {
        date: getCalendarDateString(),
        challenges: [
          {
            id: 'ch_balloon_score',
            type: 'balloon_score',
            title: 'Carnival Marksman',
            hindiTitle: 'निशानेबाज',
            description: 'Score 80 or more points',
            target: 80,
            current: 0,
            isCompleted: false,
            icon: '🎯',
          },
          {
            id: 'ch_balloon_hits',
            type: 'balloon_hits',
            title: 'Festive Balloon Popper',
            hindiTitle: 'गुब्बारा फोड़',
            description: 'Pop 6 balloons',
            target: 6,
            current: 0,
            isCompleted: false,
            icon: '🎈',
          },
        ],
        isAllCompleted: false,
        isClaimed: false,
        streak: 0,
        lastCompletedDate: null,
        claimedDates: [],
      },
    });

    // Start balloon game
    useGameStore.getState().startBalloonGame();

    // Hit 3 balloons
    useGameStore.getState().recordBalloonHit(20);
    useGameStore.getState().recordBalloonHit(20);
    useGameStore.getState().recordBalloonHit(20);

    let state = useGameStore.getState().dailyDarshan;
    const hitsChallenge = state.challenges.find((c) => c.type === 'balloon_hits')!;
    expect(hitsChallenge.current).toBe(3);
    expect(hitsChallenge.isCompleted).toBe(false);

    // 3 more hits -> completes hits challenge
    useGameStore.getState().recordBalloonHit(20);
    useGameStore.getState().recordBalloonHit(10);
    useGameStore.getState().recordBalloonHit(10); // total 100 points, 6 hits

    state = useGameStore.getState().dailyDarshan;
    expect(state.challenges.find((c) => c.type === 'balloon_hits')!.isCompleted).toBe(true);

    // End balloon game -> updates balloon_score challenge
    useGameStore.getState().endBalloonGame();

    state = useGameStore.getState().dailyDarshan;
    const scoreChallenge = state.challenges.find((c) => c.type === 'balloon_score')!;
    expect(scoreChallenge.current).toBe(100);
    expect(scoreChallenge.isCompleted).toBe(true);
  });

  it('updates bazaar sweets purchase and attraction visit challenges', () => {
    useGameStore.setState({
      dailyDarshan: {
        date: getCalendarDateString(),
        challenges: [
          {
            id: 'ch_taste_sweet',
            type: 'taste_sweet',
            title: 'Bazaar Connoisseur',
            hindiTitle: 'बाज़ार दर्शन',
            description: 'Purchase a sweet treat',
            target: 1,
            current: 0,
            isCompleted: false,
            icon: '🛍️',
          },
          {
            id: 'ch_visit_attraction',
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
        streak: 0,
        lastCompletedDate: null,
        claimedDates: [],
      },
    });

    // Buy sweet
    useGameStore.getState().purchaseItem('jalebi');
    expect(useGameStore.getState().dailyDarshan.challenges[0].isCompleted).toBe(true);

    // Watch fireworks / ride attraction
    useGameStore.getState().recordFireworksWatched();
    expect(useGameStore.getState().dailyDarshan.challenges[1].isCompleted).toBe(true);
  });

  it('updates rangoli art challenge even on repeat plays', () => {
    useGameStore.setState({
      stats: {
        ...useGameStore.getState().stats,
        rangoliCompleted: true, // already completed previously
      },
      dailyDarshan: {
        date: getCalendarDateString(),
        challenges: [
          {
            id: 'ch_rangoli_art',
            type: 'rangoli_art',
            title: 'Rangoli Artisan',
            hindiTitle: 'रंगोली रचना',
            description: 'Create rangoli',
            target: 1,
            current: 0,
            isCompleted: false,
            icon: '🎨',
          },
        ],
        isAllCompleted: false,
        isClaimed: false,
        streak: 0,
        lastCompletedDate: null,
        claimedDates: [],
      },
    });

    useGameStore.getState().completeRangoli();
    expect(useGameStore.getState().dailyDarshan.challenges[0].isCompleted).toBe(true);
  });

  // 4. Exactly-once 25-token daily bonus & claim logic
  it('allows claiming the 25-token bonus exactly once when all challenges are completed', () => {
    const initialTokens = useGameStore.getState().tokens; // 50

    useGameStore.setState({
      dailyDarshan: {
        date: '2026-10-22',
        challenges: [
          {
            id: 'ch1',
            type: 'light_diyas',
            title: 'C1',
            hindiTitle: 'C1',
            description: 'D1',
            target: 1,
            current: 1,
            isCompleted: true,
            icon: '🪔',
          },
        ],
        isAllCompleted: true,
        isClaimed: false,
        streak: 0,
        lastCompletedDate: null,
        claimedDates: [],
      },
    });

    // 1st claim -> succeeds
    const success = useGameStore.getState().claimDailyBonus();
    expect(success).toBe(true);
    expect(useGameStore.getState().tokens).toBe(initialTokens + DAILY_BONUS_TOKENS);
    expect(useGameStore.getState().dailyDarshan.isClaimed).toBe(true);
    expect(useGameStore.getState().dailyDarshan.streak).toBe(1);
    expect(useGameStore.getState().dailyDarshan.claimedDates).toContain('2026-10-22');

    // 2nd claim -> rejected
    const repeatSuccess = useGameStore.getState().claimDailyBonus();
    expect(repeatSuccess).toBe(false);
    expect(useGameStore.getState().tokens).toBe(initialTokens + DAILY_BONUS_TOKENS); // no duplicate tokens
  });

  it('rejects claiming bonus when all challenges are not yet completed', () => {
    useGameStore.setState({
      dailyDarshan: {
        date: '2026-10-22',
        challenges: [
          {
            id: 'ch1',
            type: 'light_diyas',
            title: 'C1',
            hindiTitle: 'C1',
            description: 'D1',
            target: 3,
            current: 1,
            isCompleted: false,
            icon: '🪔',
          },
        ],
        isAllCompleted: false,
        isClaimed: false,
        streak: 0,
        lastCompletedDate: null,
        claimedDates: [],
      },
    });

    const success = useGameStore.getState().claimDailyBonus();
    expect(success).toBe(false);
  });

  // 5. Streak advancement and gap resets
  it('advances streak on consecutive days and resets streak on skipped days', () => {
    // Day 1
    useGameStore.setState({
      dailyDarshan: {
        date: '2026-10-20',
        challenges: [],
        isAllCompleted: true,
        isClaimed: false,
        streak: 0,
        lastCompletedDate: null,
        claimedDates: [],
      },
    });
    useGameStore.getState().claimDailyBonus();
    expect(useGameStore.getState().dailyDarshan.streak).toBe(1);
    expect(useGameStore.getState().dailyDarshan.lastCompletedDate).toBe('2026-10-20');

    // Day 2 (Consecutive)
    useGameStore.setState({
      dailyDarshan: {
        date: '2026-10-21',
        challenges: [],
        isAllCompleted: true,
        isClaimed: false,
        streak: 1,
        lastCompletedDate: '2026-10-20',
        claimedDates: ['2026-10-20'],
      },
    });
    useGameStore.getState().claimDailyBonus();
    expect(useGameStore.getState().dailyDarshan.streak).toBe(2);
    expect(useGameStore.getState().dailyDarshan.lastCompletedDate).toBe('2026-10-21');

    // Day 4 (Missed Day 3: gap of 2 days from 2026-10-21 to 2026-10-23)
    useGameStore.setState({
      dailyDarshan: {
        date: '2026-10-23',
        challenges: [],
        isAllCompleted: true,
        isClaimed: false,
        streak: 2,
        lastCompletedDate: '2026-10-21',
        claimedDates: ['2026-10-20', '2026-10-21'],
      },
    });
    useGameStore.getState().claimDailyBonus();
    // Streak resets to 1 for starting a new streak
    expect(useGameStore.getState().dailyDarshan.streak).toBe(1);
    expect(useGameStore.getState().dailyDarshan.lastCompletedDate).toBe('2026-10-23');
  });

  // 6. Anti-cheat / Clock rollback protection
  it('prevents re-claiming bonus on previously claimed dates even if system clock is rolled back', () => {
    useGameStore.setState({
      tokens: 100,
      dailyDarshan: {
        date: '2026-10-22',
        challenges: [],
        isAllCompleted: true,
        isClaimed: false,
        streak: 1,
        lastCompletedDate: '2026-10-21',
        claimedDates: ['2026-10-22'], // already claimed earlier today
      },
    });

    const success = useGameStore.getState().claimDailyBonus();
    expect(success).toBe(false);
    expect(useGameStore.getState().tokens).toBe(100); // unchanged
  });

  // 7. Save persistence, backward compatibility & malformed save handling
  it('saves and loads daily challenge state faithfully with saveRepository', async () => {
    const saveState = {
      ...DEFAULT_SAVE_DATA,
      dailyDarshan: {
        date: '2026-10-22',
        progress: { ch_light_diyas: 2 },
        isClaimed: false,
        streak: 3,
        lastCompletedDate: '2026-10-21',
        claimedDates: ['2026-10-20', '2026-10-21'],
      },
    };

    await saveRepository.save(saveState);
    const loaded = await saveRepository.load();

    expect(loaded.dailyDarshan).toBeDefined();
    expect(loaded.dailyDarshan?.date).toBe('2026-10-22');
    expect(loaded.dailyDarshan?.progress['ch_light_diyas']).toBe(2);
    expect(loaded.dailyDarshan?.streak).toBe(3);
    expect(loaded.dailyDarshan?.claimedDates).toContain('2026-10-20');
  });

  it('gracefully provides default dailyDarshan when loading older saves missing the field', async () => {
    // Save older schema without dailyDarshan
    const legacySave: any = {
      version: 1,
      tokens: 75,
      inventory: { items: {} },
      stats: {
        balloonHighScore: 10,
        ringTossHighScore: 0,
        diyasLitCount: 2,
        rangoliCompleted: false,
        totalTokensEarned: 75,
        fireworksWatchedCount: 0,
      },
      litDiyas: ['diya_1'],
      settings: DEFAULT_SAVE_DATA.settings,
      lastSavedAt: Date.now(),
    };

    localStorage.setItem('diwali_mela_save_v1', JSON.stringify(legacySave));
    const loaded = await saveRepository.load();

    expect(loaded.dailyDarshan).toBeDefined();
    expect(loaded.dailyDarshan?.streak).toBe(0);
    expect(loaded.dailyDarshan?.isClaimed).toBe(false);
    expect(loaded.dailyDarshan?.claimedDates).toEqual([]);
  });

  it('gracefully handles corrupted dailyDarshan fields in localStorage', async () => {
    const corruptSave: any = {
      version: 1,
      tokens: 50,
      inventory: { items: {} },
      stats: DEFAULT_SAVE_DATA.stats,
      litDiyas: [],
      dailyDarshan: {
        date: 12345, // invalid type
        progress: 'corrupted',
        isClaimed: 'yes',
        streak: -5,
        claimedDates: 'not-an-array',
      },
      settings: DEFAULT_SAVE_DATA.settings,
      lastSavedAt: Date.now(),
    };

    localStorage.setItem('diwali_mela_save_v1', JSON.stringify(corruptSave));
    const loaded = await saveRepository.load();

    expect(loaded.dailyDarshan).toBeDefined();
    expect(typeof loaded.dailyDarshan?.date).toBe('string');
    expect(loaded.dailyDarshan?.progress).toEqual({});
    expect(loaded.dailyDarshan?.streak).toBe(0);
    expect(loaded.dailyDarshan?.claimedDates).toEqual([]);
  });
});
