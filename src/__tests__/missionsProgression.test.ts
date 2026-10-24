import { describe, it, expect, beforeEach } from 'vitest';
import {
  createDefaultMissionJournal,
  recordMissionAction,
  validateMissionClaim,
  validateCollectiblePickup,
  evaluateAchievements,
  validateAchievementClaim,
} from '../systems/progressionLogic';
import { FESTIVAL_MISSIONS_CONFIG } from '../types/missions';
import { useGameStore } from '../stores/useGameStore';
import { saveRepository, DEFAULT_SAVE_DATA } from '../systems/saveRepository';
import type { MiniGameStats, SaveDataV1 } from '../types/game';

describe('Mission Journal and Step Progression', () => {
  it('initializes default mission journal with first mission active', () => {
    const journal = createDefaultMissionJournal();
    expect(journal.activeMissionId).toBe(FESTIVAL_MISSIONS_CONFIG[0].id);
    expect(journal.progress[journal.activeMissionId]).toBeDefined();
    expect(journal.progress[journal.activeMissionId].currentStepIndex).toBe(0);
    expect(journal.progress[journal.activeMissionId].isCompleted).toBe(false);
    expect(journal.progress[journal.activeMissionId].isClaimed).toBe(false);
  });

  it('ignores unmatched actions and does not advance progress', () => {
    const journal = createDefaultMissionJournal();
    const result = recordMissionAction(journal, 'unrelated_action');
    expect(result.justCompletedStep).toBe(false);
    expect(result.justCompletedMission).toBe(false);
    expect(journal.progress['mission_welcome'].currentStepIndex).toBe(0);
  });

  it('progresses through mission steps sequentially upon matching actions', () => {
    let journal = createDefaultMissionJournal();

    // Step 1: Pass through entrance
    let result = recordMissionAction(journal, 'visit_entrance');
    expect(result.justCompletedStep).toBe(true);
    expect(result.justCompletedMission).toBe(false);
    journal = result.updatedJournal;
    expect(journal.progress['mission_welcome'].currentStepIndex).toBe(1);

    // Step 2: Visit central plaza
    result = recordMissionAction(journal, 'visit_central_plaza');
    expect(result.justCompletedStep).toBe(true);
    expect(result.justCompletedMission).toBe(false);
    journal = result.updatedJournal;
    expect(journal.progress['mission_welcome'].currentStepIndex).toBe(2);

    // Step 3: Kindle first diya
    result = recordMissionAction(journal, 'kindle_diya');
    expect(result.justCompletedStep).toBe(true);
    expect(result.justCompletedMission).toBe(true);
    expect(result.completedMission?.id).toBe('mission_welcome');
    journal = result.updatedJournal;

    expect(journal.progress['mission_welcome'].isCompleted).toBe(true);
    // Active mission advances to mission 2
    expect(journal.activeMissionId).toBe('mission_culture_bazaar');
  });

  it('validates mission rewards with strict idempotency (no double claims)', () => {
    let journal = createDefaultMissionJournal();
    journal = recordMissionAction(journal, 'visit_entrance').updatedJournal;
    journal = recordMissionAction(journal, 'visit_central_plaza').updatedJournal;
    journal = recordMissionAction(journal, 'kindle_diya').updatedJournal;

    // First claim: success
    const claim1 = validateMissionClaim(journal, 'mission_welcome');
    expect(claim1.valid).toBe(true);
    expect(claim1.rewardTokens).toBe(25);
    journal = claim1.updatedJournal;
    expect(journal.progress['mission_welcome'].isClaimed).toBe(true);

    // Second claim: rejected
    const claim2 = validateMissionClaim(journal, 'mission_welcome');
    expect(claim2.valid).toBe(false);
    expect(claim2.rewardTokens).toBe(0);
    expect(claim2.reason).toContain('already claimed');
  });

  it('rejects claim for uncompleted mission', () => {
    const journal = createDefaultMissionJournal();
    const claim = validateMissionClaim(journal, 'mission_welcome');
    expect(claim.valid).toBe(false);
    expect(claim.reason).toContain('not completed yet');
  });
});

describe('Festival Exploration Collectibles', () => {
  it('allows collecting a valid keepsake and prevents duplicate collection', () => {
    const collected: string[] = [];
    const validPickup = validateCollectiblePickup(collected, 'collectible_garland');
    expect(validPickup.valid).toBe(true);
    expect(validPickup.config?.id).toBe('collectible_garland');
    expect(validPickup.updatedList).toEqual(['collectible_garland']);

    // Duplicate pickup attempt
    const dupPickup = validateCollectiblePickup(validPickup.updatedList, 'collectible_garland');
    expect(dupPickup.valid).toBe(false);
    expect(dupPickup.config).toBeNull();
    expect(dupPickup.updatedList).toHaveLength(1);
  });

  it('rejects unknown collectible IDs', () => {
    const pickup = validateCollectiblePickup([], 'mysterious_gem');
    expect(pickup.valid).toBe(false);
    expect(pickup.config).toBeNull();
  });
});

describe('Festival Achievements Engine', () => {
  const baseStats: MiniGameStats = {
    balloonHighScore: 0,
    ringTossHighScore: 0,
    diyasLitCount: 0,
    rangoliCompleted: false,
    totalTokensEarned: 50,
    fireworksWatchedCount: 0,
    magicalDiyasCollected: 0,
    questCompleted: false,
  };

  it('evaluates newly qualified achievements correctly', () => {
    const context = {
      stats: { ...baseStats, diyasLitCount: 1, balloonHighScore: 35 },
      magicalDiyasCount: 5,
      collectiblesCount: 4,
      hasWatchedFireworks: true,
      hasEnjoyedStage: true,
      ringTossHits: 3,
      dailyStreak: 1,
    };

    const unlocked = evaluateAchievements([], context);
    const unlockedIds = unlocked.map((a) => a.id);

    expect(unlockedIds).toContain('ach_first_light');
    expect(unlockedIds).toContain('ach_all_sacred_diyas');
    expect(unlockedIds).toContain('ach_carnival_ace');
    expect(unlockedIds).toContain('ach_ring_master');
    expect(unlockedIds).toContain('ach_mela_explorer');
    expect(unlockedIds).toContain('ach_cultural_connoisseur');
    expect(unlockedIds).toContain('ach_sky_spectacular');
    expect(unlockedIds).toContain('ach_darshan_devotee');
  });

  it('does not re-unlock already unlocked achievements', () => {
    const context = {
      stats: { ...baseStats, diyasLitCount: 2 },
      magicalDiyasCount: 0,
      collectiblesCount: 0,
      hasWatchedFireworks: false,
      hasEnjoyedStage: false,
      ringTossHits: 0,
      dailyStreak: 0,
    };

    const unlocked = evaluateAchievements(['ach_first_light'], context);
    expect(unlocked.find((a) => a.id === 'ach_first_light')).toBeUndefined();
  });

  it('enforces single-claim reward idempotency for achievements', () => {
    const unlocked = ['ach_first_light'];
    let claimed: string[] = [];

    // First claim
    const claim1 = validateAchievementClaim(unlocked, claimed, 'ach_first_light');
    expect(claim1.valid).toBe(true);
    expect(claim1.rewardTokens).toBe(10);
    claimed = claim1.updatedClaimedList;

    // Second claim
    const claim2 = validateAchievementClaim(unlocked, claimed, 'ach_first_light');
    expect(claim2.valid).toBe(false);
    expect(claim2.rewardTokens).toBe(0);

    // Locked achievement claim
    const claim3 = validateAchievementClaim(unlocked, claimed, 'ach_all_sacred_diyas');
    expect(claim3.valid).toBe(false);
  });
});

describe('Store & Progression Integration', () => {
  beforeEach(async () => {
    await useGameStore.getState().resetProgress();
  });

  it('discovers a festival keepsake, increments tokens, and guards against duplicate pickup', () => {
    const store = useGameStore.getState();
    const initialTokens = store.tokens;

    // Discover keepsake
    const success = store.discoverCollectible('collectible_garland');
    expect(success).toBe(true);

    const after = useGameStore.getState();
    expect(after.collectibles).toContain('collectible_garland');
    expect(after.tokens).toBe(initialTokens + 15);

    // Duplicate pickup returns false
    const dup = useGameStore.getState().discoverCollectible('collectible_garland');
    expect(dup).toBe(false);
    expect(useGameStore.getState().tokens).toBe(initialTokens + 15);
  });

  it('advances mission on zone change and allows claiming completion reward', () => {
    useGameStore.getState().setCurrentZone('entrance');
    useGameStore.getState().setCurrentZone('central_plaza');
    useGameStore.getState().collectMagicalDiya('magical_diya_entrance');

    const missionWelcome = useGameStore.getState().missions.progress['mission_welcome'];
    expect(missionWelcome.isCompleted).toBe(true);

    const initialTokens = useGameStore.getState().tokens;
    const claimSuccess = useGameStore.getState().claimMissionReward('mission_welcome');
    expect(claimSuccess).toBe(true);
    expect(useGameStore.getState().tokens).toBe(initialTokens + 25);

    // Second claim fails
    const secondClaim = useGameStore.getState().claimMissionReward('mission_welcome');
    expect(secondClaim).toBe(false);
  });

  it('unlocks achievements and allows claiming achievement rewards', () => {
    // Kindling diya unlocks 'ach_first_light'
    useGameStore.getState().collectMagicalDiya('magical_diya_entrance');
    const store = useGameStore.getState();
    expect(store.achievements).toContain('ach_first_light');

    const tokensBefore = store.tokens;
    const claimSuccess = store.claimAchievementReward('ach_first_light');
    expect(claimSuccess).toBe(true);
    expect(useGameStore.getState().tokens).toBe(tokensBefore + 10);

    // Cannot claim twice
    const secondClaim = useGameStore.getState().claimAchievementReward('ach_first_light');
    expect(secondClaim).toBe(false);
  });

  it('sanitizes and persists progression data across save/load cycles safely', async () => {
    const dirtyData: SaveDataV1 = {
      ...DEFAULT_SAVE_DATA,
      version: 1,
      tokens: 75,
      collectibles: ['collectible_garland', 'collectible_garland', 'invalid_hack_item'],
      achievements: ['ach_first_light', 'ach_first_light', 'fake_achievement'],
      claimedAchievements: ['ach_first_light'],
    };

    await saveRepository.save(dirtyData);
    const loaded = await saveRepository.load();

    expect(loaded.collectibles).toEqual(['collectible_garland']);
    expect(loaded.achievements).toEqual(['ach_first_light']);
    expect(loaded.claimedAchievements).toEqual(['ach_first_light']);
    expect(loaded.missions).toBeDefined();
    expect(loaded.missions?.activeMissionId).toBe('mission_welcome');
  });
});
