import {
  FESTIVAL_MISSIONS_CONFIG,
  type FestivalMissionConfig,
  type MissionProgress,
  type MissionJournalSaveState,
} from '../types/missions';
import {
  FESTIVAL_COLLECTIBLES_CONFIG,
  type FestivalCollectibleConfig,
} from '../types/collectibles';
import {
  FESTIVAL_ACHIEVEMENTS_CONFIG,
  type FestivalAchievementConfig,
} from '../types/achievements';
import type { MiniGameStats } from '../types/game';

export interface ProgressionEvaluationContext {
  stats: MiniGameStats;
  magicalDiyasCount: number;
  collectiblesCount: number;
  hasWatchedFireworks: boolean;
  hasEnjoyedStage: boolean;
  ringTossHits: number;
  dailyStreak: number;
}
/**
 * Creates default initial state for missions journal.
 */
export function createDefaultMissionJournal(): MissionJournalSaveState {
  const progress: Record<string, MissionProgress> = {};
  for (const mission of FESTIVAL_MISSIONS_CONFIG) {
    progress[mission.id] = {
      currentStepIndex: 0,
      stepCounts: {},
      isCompleted: false,
      isClaimed: false,
    };
  }
  return {
    activeMissionId: FESTIVAL_MISSIONS_CONFIG[0].id,
    progress,
  };
}

/**
 * Advances a step in the active mission if the action matches.
 */
export function recordMissionAction(
  journal: MissionJournalSaveState,
  actionId: string,
  amount = 1
): {
  updatedJournal: MissionJournalSaveState;
  justCompletedStep: boolean;
  justCompletedMission: boolean;
  completedMission: FestivalMissionConfig | null;
} {
  const activeMission = FESTIVAL_MISSIONS_CONFIG.find((m) => m.id === journal.activeMissionId);
  if (!activeMission) {
    return {
      updatedJournal: journal,
      justCompletedStep: false,
      justCompletedMission: false,
      completedMission: null,
    };
  }

  const currentProgress = journal.progress[activeMission.id] || {
    currentStepIndex: 0,
    stepCounts: {},
    isCompleted: false,
    isClaimed: false,
  };

  if (currentProgress.isCompleted) {
    return {
      updatedJournal: journal,
      justCompletedStep: false,
      justCompletedMission: false,
      completedMission: null,
    };
  }

  const stepIndex = currentProgress.currentStepIndex;
  const currentStep = activeMission.steps[stepIndex];
  if (!currentStep) {
    return {
      updatedJournal: journal,
      justCompletedStep: false,
      justCompletedMission: false,
      completedMission: null,
    };
  }

  // Check if action matches current step
  const isMatch =
    currentStep.id === actionId ||
    (actionId.startsWith('visit_') && currentStep.zone === actionId.replace('visit_', '')) ||
    (actionId === 'kindle_diya' && currentStep.id.includes('diya')) ||
    (actionId === 'collect_keepsake' && currentStep.id.includes('keepsake'));

  if (!isMatch) {
    return {
      updatedJournal: journal,
      justCompletedStep: false,
      justCompletedMission: false,
      completedMission: null,
    };
  }

  const existingCount = currentProgress.stepCounts[currentStep.id] || 0;
  const newCount = existingCount + amount;
  const updatedStepCounts = {
    ...currentProgress.stepCounts,
    [currentStep.id]: newCount,
  };

  const stepCompleted = newCount >= currentStep.targetCount;
  let nextStepIndex = stepIndex;
  let missionCompleted = false;

  if (stepCompleted) {
    nextStepIndex = stepIndex + 1;
    if (nextStepIndex >= activeMission.steps.length) {
      missionCompleted = true;
    }
  }

  // Advance active mission pointer if this mission is now completed
  let nextActiveMissionId = journal.activeMissionId;
  if (missionCompleted) {
    const currentIdx = FESTIVAL_MISSIONS_CONFIG.findIndex((m) => m.id === activeMission.id);
    if (currentIdx !== -1 && currentIdx + 1 < FESTIVAL_MISSIONS_CONFIG.length) {
      nextActiveMissionId = FESTIVAL_MISSIONS_CONFIG[currentIdx + 1].id;
    }
  }

  const updatedProgress: MissionProgress = {
    ...currentProgress,
    currentStepIndex: nextStepIndex,
    stepCounts: updatedStepCounts,
    isCompleted: missionCompleted,
  };

  const updatedJournal: MissionJournalSaveState = {
    activeMissionId: nextActiveMissionId,
    progress: {
      ...journal.progress,
      [activeMission.id]: updatedProgress,
    },
  };

  return {
    updatedJournal,
    justCompletedStep: stepCompleted,
    justCompletedMission: missionCompleted,
    completedMission: missionCompleted ? activeMission : null,
  };
}

/**
 * Validates claiming a mission reward (idempotency check).
 */
export function validateMissionClaim(
  journal: MissionJournalSaveState,
  missionId: string
): {
  valid: boolean;
  rewardTokens: number;
  updatedJournal: MissionJournalSaveState;
  reason?: string;
} {
  const missionConfig = FESTIVAL_MISSIONS_CONFIG.find((m) => m.id === missionId);
  if (!missionConfig) {
    return { valid: false, rewardTokens: 0, updatedJournal: journal, reason: 'Unknown mission' };
  }

  const progress = journal.progress[missionId];
  if (!progress || !progress.isCompleted) {
    return { valid: false, rewardTokens: 0, updatedJournal: journal, reason: 'Mission not completed yet' };
  }

  if (progress.isClaimed) {
    return { valid: false, rewardTokens: 0, updatedJournal: journal, reason: 'Reward already claimed' };
  }

  const updatedJournal: MissionJournalSaveState = {
    ...journal,
    progress: {
      ...journal.progress,
      [missionId]: {
        ...progress,
        isClaimed: true,
      },
    },
  };

  return {
    valid: true,
    rewardTokens: missionConfig.rewardTokens,
    updatedJournal,
  };
}

/**
 * Validates picking up a festival collectible.
 */
export function validateCollectiblePickup(
  collectedList: string[],
  collectibleId: string
): {
  valid: boolean;
  config: FestivalCollectibleConfig | null;
  updatedList: string[];
} {
  if (collectedList.includes(collectibleId)) {
    return { valid: false, config: null, updatedList: collectedList };
  }

  const config = FESTIVAL_COLLECTIBLES_CONFIG.find((c) => c.id === collectibleId);
  if (!config) {
    return { valid: false, config: null, updatedList: collectedList };
  }

  return {
    valid: true,
    config,
    updatedList: [...collectedList, collectibleId],
  };
}

/**
 * Evaluates which achievements qualify for unlock based on player stats.
 */
export function evaluateAchievements(
  alreadyUnlocked: string[],
  context: ProgressionEvaluationContext
): FestivalAchievementConfig[] {
  const newlyUnlocked: FestivalAchievementConfig[] = [];

  for (const ach of FESTIVAL_ACHIEVEMENTS_CONFIG) {
    if (alreadyUnlocked.includes(ach.id)) continue;

    let qualifies = false;
    switch (ach.criteria.type) {
      case 'diyas_lit':
        qualifies = (context.stats.diyasLitCount || 0) + (context.magicalDiyasCount || 0) >= ach.criteria.threshold;
        break;
      case 'sacred_diyas':
        qualifies = context.magicalDiyasCount >= ach.criteria.threshold;
        break;
      case 'balloon_score':
        qualifies = (context.stats.balloonHighScore || 0) >= ach.criteria.threshold;
        break;
      case 'ring_hits':
        qualifies = (context.ringTossHits || 0) >= ach.criteria.threshold;
        break;
      case 'collectibles':
        qualifies = context.collectiblesCount >= ach.criteria.threshold;
        break;
      case 'stage_enjoyed':
        qualifies = context.hasEnjoyedStage;
        break;
      case 'fireworks':
        qualifies = context.hasWatchedFireworks || (context.stats.fireworksWatchedCount || 0) >= ach.criteria.threshold;
        break;
      case 'daily_streak':
        qualifies = context.dailyStreak >= ach.criteria.threshold;
        break;
    }

    if (qualifies) {
      newlyUnlocked.push(ach);
    }
  }

  return newlyUnlocked;
}

/**
 * Validates claiming an achievement reward.
 */
export function validateAchievementClaim(
  unlockedList: string[],
  claimedList: string[],
  achievementId: string
): {
  valid: boolean;
  rewardTokens: number;
  updatedClaimedList: string[];
} {
  if (!unlockedList.includes(achievementId)) {
    return { valid: false, rewardTokens: 0, updatedClaimedList: claimedList };
  }

  if (claimedList.includes(achievementId)) {
    return { valid: false, rewardTokens: 0, updatedClaimedList: claimedList };
  }

  const ach = FESTIVAL_ACHIEVEMENTS_CONFIG.find((a) => a.id === achievementId);
  if (!ach) {
    return { valid: false, rewardTokens: 0, updatedClaimedList: claimedList };
  }

  return {
    valid: true,
    rewardTokens: ach.rewardTokens,
    updatedClaimedList: [...claimedList, achievementId],
  };
}
