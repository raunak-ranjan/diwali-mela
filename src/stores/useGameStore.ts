import { create } from 'zustand';
import type { GameZone, InteractionPromptState, ShopItem, GraphicsQuality, MiniGameStats, QuestNotification } from '../types/game';
import { KNOWN_COSMETICS, type PlayerCosmetics, type TokenTransaction } from '../types/rewards';
import {
  type ChallengeType,
  type DailyDarshanState,
  DAILY_BONUS_TOKENS,
  getCalendarDateString,
  generateDailyChallenges,
  isConsecutiveDay,
} from '../types/daily';
import { saveRepository } from '../systems/saveRepository';
import { soundEngine } from '../audio/soundEngine';
import { useInputStore } from './useInputStore';

export const SHOP_CATALOG: ShopItem[] = [
  {
    id: 'gulab_jamun',
    name: 'Gulab Jamun Plate',
    hindiName: 'गुलाब जामुन',
    category: 'sweet',
    price: 15,
    description: 'Warm, melt-in-mouth milk-solid dumplings soaked in aromatic cardamom & saffron syrup.',
    icon: '🍯',
    blessing: 'May your life be filled with sweet warmth and abundance!',
  },
  {
    id: 'kaju_katli',
    name: 'Silver Foil Kaju Katli',
    hindiName: 'काजू कतली',
    category: 'sweet',
    price: 25,
    description: 'Rich royal cashew diamonds topped with traditional silver vark.',
    icon: '💎',
    blessing: 'May prosperity shine like silver foil on your endeavors!',
  },
  {
    id: 'jalebi',
    name: 'Crispy Saffron Jalebi',
    hindiName: 'केसरिया जलेबी',
    category: 'sweet',
    price: 10,
    description: 'Hot, spiral crunchy golden loops dripping with saffron sugar nectar.',
    icon: '🌀',
    blessing: 'May every twist of fate lead you to golden joy!',
  },
  {
    id: 'motichoor_laddoo',
    name: 'Motichoor Laddoo Box',
    hindiName: 'मोतीचूर के लड्डू',
    category: 'sweet',
    price: 20,
    description: 'Classic festival pearls of besan fried in pure desi ghee.',
    icon: '🟠',
    blessing: 'Ganesh-ji blessings for sweet beginnings and victory!',
  },
  {
    id: 'clay_diyas_set',
    name: 'Handcrafted Clay Diya Set',
    hindiName: 'मिट्टी के दीपक',
    category: 'diya',
    price: 12,
    description: 'Traditional teracotta oil lamps sculpted by rural potters.',
    icon: '🪔',
    blessing: 'May light triumph over darkness in your home!',
  },
  {
    id: 'phooljhadi',
    name: 'Golden Sparklers Box',
    hindiName: 'फुलझड़ी',
    category: 'sparkler',
    price: 30,
    description: 'Gentle golden sparklers producing sparkling festive stars.',
    icon: '✨',
    blessing: 'May your days twinkle with joy, health, and cheer!',
  },
  {
    id: 'kandil_lantern',
    name: 'Akash Kandil Festival Lantern',
    hindiName: 'आकाश कंदील',
    category: 'handicraft',
    price: 40,
    description: 'Intricately folded colorful geometric sky lantern with hanging ribbons.',
    icon: '🏮',
    blessing: 'May beacon lights guide auspicious fortune to your doorstep!',
  },
];

export const MAX_RING_TOSS_RINGS = 5;
export const RING_TOSS_TIME_LIMIT = 30;
export const calculateRingTossReward = (score: number): number => {
  if (typeof score !== 'number' || score <= 0 || isNaN(score)) return 0;
  return Math.min(25, Math.max(5, Math.floor(score / 3)));
};

export type ActiveModalType = 
  | 'none'
  | 'welcome'
  | 'balloon_game'
  | 'ring_toss'
  | 'shop'
  | 'rangoli'
  | 'finale'
  | 'stage'
  | 'fireworks'
  | 'settings'
  | 'pause'
  | 'rewards'
  | 'inventory';

interface GameState {
  isLoaded: boolean;
  gameStarted: boolean;
  currentZone: GameZone;
  tokens: number;
  inventory: Record<string, number>;
  litDiyas: string[];
  stats: MiniGameStats;
  cosmetics: PlayerCosmetics;
  tokenHistory: TokenTransaction[];
  recentTokenDelta: { amount: number; id: string } | null;
  activeModal: ActiveModalType;
  prompt: InteractionPromptState | null;
  quest: {
    id: string;
    title: string;
    description: string;
    targetCount: number;
    collectedDiyas: string[];
    isCompleted: boolean;
    rewardTokens: number;
  };
  questNotification: QuestNotification | null;
  dailyDarshan: DailyDarshanState;
  sparklerActiveUntil: number | null;
  balloonGame: {
    score: number;
    timeLeft: number;
    isPlaying: boolean;
    highScore: number;
  };
  ringTossGame: {
    score: number;
    ringsRemaining: number;
    timeLeft: number;
    isPlaying: boolean;
    highScore: number;
    hitsCount: number;
  };
  // Attractions: Ferris Wheel, Cultural Stage & Fireworks
  ferrisWheelRide: {
    isRiding: boolean;
    cabinIndex: number;
    rotationAngle: number;
  };
  culturalStageState: {
    isPlayingMusic: boolean;
    activeRaag: string;
    lightingTheme: 'gold' | 'peacock' | 'saffron';
  };
  fireworksState: {
    mode: 'idle' | 'scheduled' | 'interactive';
    countdown: number;
    showTimeRemaining: number;
    manualLaunchesCount: number;
    lastManualLaunch: number;
    lastBurstType: 'peony' | 'willow' | 'ring' | 'crackle' | 'kamuro';
  };
  settings: {
    graphicsQuality: GraphicsQuality;
    masterVolume: number;
    sfxVolume: number;
    musicVolume: number;
    touchSensitivity: number;
    reducedMotion: boolean;
  };
  // Actions
  initializeSave: () => Promise<void>;
  startGame: () => void;
  setCurrentZone: (zone: GameZone) => void;
  setPrompt: (prompt: InteractionPromptState | null) => void;
  openModal: (modal: ActiveModalType) => void;
  closeModal: () => void;
  addTokens: (amount: number, source?: string) => void;
  purchaseItem: (itemId: string) => boolean;
  consumeInventoryItem: (itemId: string) => { success: boolean; message: string };
  lightSparkler: () => { success: boolean; message: string };
  offerDiyaToShrine: () => { success: boolean; message: string };
  stopSparkler: () => void;
  unlockCosmetic: (cosmeticId: string) => boolean;
  equipCosmetic: (cosmeticId: string | null) => boolean;
  dismissTokenDelta: () => void;
  lightDiya: (diyaId: string) => void;
  completeRangoli: () => void;
  collectMagicalDiya: (diyaId: string, diyaName?: string) => boolean;
  dismissQuestNotification: () => void;
  claimDailyBonus: () => boolean;
  refreshDailyDarshan: (overrideDate?: string) => void;
  recordFireworksWatched: () => void;
  updateSettings: (newSettings: Partial<GameState['settings']>) => void;
  resetProgress: () => Promise<void>;

  // Mini-game actions
  startBalloonGame: () => void;
  recordBalloonHit: (points?: number) => void;
  tickBalloonGame: () => void;
  endBalloonGame: () => void;
  startRingTossGame: () => void;
  recordRingTossThrow: (points: number, isHit: boolean) => void;
  tickRingTossGame: () => void;
  endRingTossGame: () => void;
  cancelRingTossGame: () => void;

  // Attraction actions
  boardFerrisWheel: (cabinIndex?: number) => void;
  exitFerrisWheel: () => void;
  updateFerrisWheelAngle: (angle: number) => void;
  setStagePlayingMusic: (playing: boolean) => void;
  setStageRaag: (raag: string) => void;
  setStageLightingTheme: (theme: 'gold' | 'peacock' | 'saffron') => void;
  startScheduledFireworks: () => void;
  stopFireworksShow: () => void;
  tickFireworks: () => void;
  triggerManualFirework: (burstType?: 'peony' | 'willow' | 'ring' | 'crackle' | 'kamuro') => void;
}

const persistState = (current: GameState) => {
  saveRepository.save({
    version: 1,
    tokens: current.tokens,
    inventory: { items: current.inventory },
    litDiyas: current.litDiyas,
    stats: current.stats,
    quest: {
      collectedDiyas: current.quest.collectedDiyas,
      isCompleted: current.quest.isCompleted,
    },
    cosmetics: current.cosmetics,
    tokenHistory: current.tokenHistory,
    dailyDarshan: {
      date: current.dailyDarshan.date,
      progress: current.dailyDarshan.challenges.reduce((acc, c) => {
        acc[c.id] = c.current;
        return acc;
      }, {} as Record<string, number>),
      isClaimed: current.dailyDarshan.isClaimed,
      streak: current.dailyDarshan.streak,
      lastCompletedDate: current.dailyDarshan.lastCompletedDate,
      claimedDates: current.dailyDarshan.claimedDates,
    },
    settings: current.settings,
    lastSavedAt: Date.now(),
  });
};

const applyDailyProgress = (
  currentDaily: DailyDarshanState,
  type: ChallengeType,
  amount = 1,
  isAbsoluteScore = false,
  injectedDate?: string
): { updatedDaily: DailyDarshanState; justCompletedAll: boolean } => {
  const today = injectedDate || getCalendarDateString();
  let daily = currentDaily;

  // If date rolled over while app was running
  if (daily.date !== today) {
    const consecutive = isConsecutiveDay(daily.date, today);
    const wasClaimed = daily.isClaimed;
    daily = {
      date: today,
      challenges: generateDailyChallenges(today),
      isAllCompleted: false,
      isClaimed: daily.claimedDates.includes(today),
      streak: consecutive && wasClaimed ? daily.streak : 0,
      lastCompletedDate: daily.lastCompletedDate,
      claimedDates: daily.claimedDates,
    };
  }

  let progressChanged = false;
  const updatedChallenges = daily.challenges.map((ch) => {
    if (ch.type !== type || ch.isCompleted) return ch;
    progressChanged = true;
    const newCurrent = isAbsoluteScore
      ? Math.max(ch.current, amount)
      : Math.min(ch.target, ch.current + amount);
    return {
      ...ch,
      current: newCurrent,
      isCompleted: newCurrent >= ch.target,
    };
  });

  if (!progressChanged) {
    return { updatedDaily: daily, justCompletedAll: false };
  }

  const allCompletedNow = updatedChallenges.length > 0 && updatedChallenges.every((c) => c.isCompleted);
  const justCompletedAll = allCompletedNow && !daily.isAllCompleted;

  return {
    updatedDaily: {
      ...daily,
      challenges: updatedChallenges,
      isAllCompleted: allCompletedNow,
    },
    justCompletedAll,
  };
};

export const useGameStore = create<GameState>((set, get) => ({
  isLoaded: false,
  gameStarted: false,
  currentZone: 'entrance',
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
  activeModal: 'welcome',
  prompt: null,
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
  dailyDarshan: {
    date: getCalendarDateString(),
    challenges: generateDailyChallenges(getCalendarDateString()),
    isAllCompleted: false,
    isClaimed: false,
    streak: 0,
    lastCompletedDate: null,
    claimedDates: [],
  },
  sparklerActiveUntil: null,
  balloonGame: {
    score: 0,
    timeLeft: 30,
    isPlaying: false,
    highScore: 0,
  },
  ringTossGame: {
    score: 0,
    ringsRemaining: 5,
    timeLeft: 30,
    isPlaying: false,
    highScore: 0,
    hitsCount: 0,
  },
  ferrisWheelRide: {
    isRiding: false,
    cabinIndex: 0,
    rotationAngle: 0,
  },
  culturalStageState: {
    isPlayingMusic: false,
    activeRaag: 'Raag Yaman',
    lightingTheme: 'gold',
  },
  fireworksState: {
    mode: 'idle',
    countdown: 3,
    showTimeRemaining: 20,
    manualLaunchesCount: 0,
    lastManualLaunch: 0,
    lastBurstType: 'peony',
  },
  settings: {
    graphicsQuality: (typeof window !== 'undefined' && useInputStore.getState().isTouchDevice) ? 'medium' : 'high',
    masterVolume: 0.8,
    sfxVolume: 0.8,
    musicVolume: 0.6,
    touchSensitivity: 1.0,
    reducedMotion: false,
  },

  initializeSave: async () => {
    try {
      const data = await saveRepository.load();
      const hasSaved = typeof saveRepository.hasSavedData === 'function' ? saveRepository.hasSavedData() : false;
      const isTouch = useInputStore.getState().isTouchDevice;
      const restoredSettings = {
        ...data.settings,
        graphicsQuality: (!hasSaved && isTouch) ? 'medium' : data.settings.graphicsQuality,
      };
      const today = getCalendarDateString();
      const rawDaily = data.dailyDarshan;
      let restoredDaily: DailyDarshanState;

      if (rawDaily && rawDaily.date === today) {
        const challenges = generateDailyChallenges(today).map((ch) => {
          const current = Math.min(ch.target, rawDaily.progress[ch.id] || 0);
          return {
            ...ch,
            current,
            isCompleted: current >= ch.target,
          };
        });
        const isAllCompleted = challenges.length > 0 && challenges.every((c) => c.isCompleted);
        const isClaimed = Boolean(rawDaily.isClaimed || rawDaily.claimedDates.includes(today));
        restoredDaily = {
          date: today,
          challenges,
          isAllCompleted,
          isClaimed,
          streak: rawDaily.streak || 0,
          lastCompletedDate: rawDaily.lastCompletedDate || null,
          claimedDates: rawDaily.claimedDates || [],
        };
      } else {
        const prevDate = rawDaily?.date;
        const prevClaimed = Boolean(rawDaily?.isClaimed);
        let streak = rawDaily?.streak || 0;
        if (prevDate && prevDate !== today) {
          const consecutive = isConsecutiveDay(prevDate, today);
          if (!consecutive || !prevClaimed) {
            streak = 0;
          }
        }
        const challenges = generateDailyChallenges(today);
        const claimedDates = rawDaily?.claimedDates || [];
        const isClaimed = claimedDates.includes(today);
        restoredDaily = {
          date: today,
          challenges,
          isAllCompleted: false,
          isClaimed,
          streak,
          lastCompletedDate: rawDaily?.lastCompletedDate || null,
          claimedDates,
        };
      }

      set({
        tokens: data.tokens,
        inventory: data.inventory.items,
        sparklerActiveUntil: null,
        litDiyas: data.litDiyas,
        stats: data.stats,
        cosmetics: data.cosmetics || { unlocked: [], equipped: null },
        tokenHistory: data.tokenHistory && data.tokenHistory.length > 0
          ? data.tokenHistory
          : [
              {
                id: 'welcome_gift',
                amount: data.tokens,
                source: 'Festival Welcome Gift',
                timestamp: Date.now(),
              },
            ],
        settings: restoredSettings,
        dailyDarshan: restoredDaily,
        quest: {
          id: 'five_sacred_diyas',
          title: 'The Five Sacred Lights',
          description: 'Kindle all 5 Sacred Golden Diyas hidden across the fairground.',
          targetCount: 5,
          collectedDiyas: data.quest?.collectedDiyas || [],
          isCompleted: Boolean(data.quest?.isCompleted || data.stats?.questCompleted),
          rewardTokens: 50,
        },
        balloonGame: {
          score: 0,
          timeLeft: 30,
          isPlaying: false,
          highScore: data.stats.balloonHighScore || 0,
        },
        ringTossGame: {
          score: 0,
          ringsRemaining: 5,
          timeLeft: 30,
          isPlaying: false,
          highScore: data.stats.ringTossHighScore || 0,
          hitsCount: 0,
        },
        isLoaded: true,
      });
      soundEngine.setVolumes(restoredSettings.masterVolume, restoredSettings.sfxVolume, restoredSettings.musicVolume);
    } catch (err) {
      console.error('[GameStore] Error during initializeSave, falling back safely:', err);
      // Ensure application never hangs indefinitely
      set({ isLoaded: true });
    }
  },

  startGame: () => {
    soundEngine.resume();
    soundEngine.startFestiveMusic();
    set({ gameStarted: true, activeModal: 'none' });
  },

  setCurrentZone: (zone: GameZone) => {
    if (get().currentZone === zone) return;
    set({ currentZone: zone });
  },

  setPrompt: (prompt) => {
    const current = get().prompt;
    if (current === prompt) return;
    if (
      current &&
      prompt &&
      current.active === prompt.active &&
      current.id === prompt.id &&
      current.label === prompt.label &&
      current.sublabel === prompt.sublabel &&
      current.actionType === prompt.actionType &&
      current.position?.[0] === prompt.position?.[0] &&
      current.position?.[1] === prompt.position?.[1] &&
      current.position?.[2] === prompt.position?.[2]
    ) {
      return;
    }
    set({ prompt });
  },

  openModal: (modal: ActiveModalType) => {
    set({ activeModal: modal });
  },

  closeModal: () => {
    const current = get();
    if (current.culturalStageState.isPlayingMusic) {
      soundEngine.stopFestiveMusic();
    }
    set({
      activeModal: 'none',
      culturalStageState: {
        ...current.culturalStageState,
        isPlayingMusic: false,
      },
      ringTossGame: {
        ...current.ringTossGame,
        isPlaying: false,
        ringsRemaining: MAX_RING_TOSS_RINGS,
        timeLeft: RING_TOSS_TIME_LIMIT,
      },
      balloonGame: {
        ...current.balloonGame,
        isPlaying: false,
      },
    });
  },

  addTokens: (amount: number, source: string = 'Festival Activity') => {
    if (typeof amount !== 'number' || amount <= 0 || isNaN(amount)) return;
    const current = get();
    const newTokens = current.tokens + amount;
    const newStats: MiniGameStats = {
      ...current.stats,
      totalTokensEarned: (current.stats?.totalTokensEarned ?? current.tokens) + amount,
    };
    const updatedHistory: TokenTransaction[] = [
      ...current.tokenHistory,
      {
        id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        amount,
        source,
        timestamp: Date.now(),
      },
    ].slice(-20);

    soundEngine.playTokenEarned();
    set({
      tokens: newTokens,
      stats: newStats,
      tokenHistory: updatedHistory,
      recentTokenDelta: { amount, id: String(Date.now()) },
    });
    persistState(get());
  },

  purchaseItem: (itemId: string) => {
    const item = SHOP_CATALOG.find((i) => i.id === itemId);
    if (!item) return false;

    const current = get();
    if (current.tokens < item.price) return false;

    const updatedTokens = current.tokens - item.price;
    const updatedInventory = {
      ...current.inventory,
      [itemId]: (current.inventory[itemId] || 0) + 1,
    };
    const updatedHistory: TokenTransaction[] = [
      ...current.tokenHistory,
      {
        id: `spend_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        amount: -item.price,
        source: `Bought ${item.name}`,
        timestamp: Date.now(),
      },
    ].slice(-20);

    soundEngine.playTokenEarned();

    const { updatedDaily, justCompletedAll } = applyDailyProgress(current.dailyDarshan, 'taste_sweet', 1);
    if (justCompletedAll) soundEngine.playQuestChime();

    set({
      tokens: updatedTokens,
      inventory: updatedInventory,
      tokenHistory: updatedHistory,
      recentTokenDelta: { amount: -item.price, id: String(Date.now()) },
      dailyDarshan: updatedDaily,
      questNotification: justCompletedAll
        ? {
            id: `daily_all_completed_${Date.now()}`,
            title: '✨ Daily Darshan Completed!',
            message: 'All 3 daily objectives fulfilled! Claim your +25 🪙 daily set bonus.',
            type: 'completed',
            timestamp: Date.now(),
          }
        : current.questNotification,
    });
    persistState(get());
    return true;
  },

  consumeInventoryItem: (itemId: string) => {
    const current = get();
    const item = SHOP_CATALOG.find((i) => i.id === itemId);

    // Only allow known sweets
    const validSweets = ['gulab_jamun', 'kaju_katli', 'jalebi', 'motichoor_laddoo'];
    if (!item || !validSweets.includes(itemId)) {
      return { success: false, message: 'Only festival sweets can be consumed.' };
    }

    const currentCount = current.inventory[itemId] || 0;
    if (currentCount <= 0) {
      soundEngine.playErrorSound();
      return { success: false, message: `You don't have any ${item.name} to eat.` };
    }

    const updatedInventory = {
      ...current.inventory,
      [itemId]: currentCount - 1,
    };

    soundEngine.playPurchaseSuccess();

    const { updatedDaily, justCompletedAll } = applyDailyProgress(current.dailyDarshan, 'taste_sweet', 1);
    if (justCompletedAll) soundEngine.playQuestChime();

    set({
      inventory: updatedInventory,
      dailyDarshan: updatedDaily,
      questNotification: justCompletedAll
        ? {
            id: `daily_all_completed_${Date.now()}`,
            title: '✨ Daily Darshan Completed!',
            message: 'All 3 daily objectives fulfilled! Claim your +25 🪙 daily set bonus.',
            type: 'completed',
            timestamp: Date.now(),
          }
        : current.questNotification,
    });

    persistState(get());
    return {
      success: true,
      message: `Delicious! You enjoyed ${item.name}. ${item.blessing}`,
    };
  },

  lightSparkler: () => {
    const current = get();
    const sparklerCount = current.inventory['phooljhadi'] || 0;
    if (sparklerCount <= 0) {
      soundEngine.playErrorSound();
      return { success: false, message: 'You have no Golden Sparklers in your pouch.' };
    }

    if (current.sparklerActiveUntil && current.sparklerActiveUntil > Date.now()) {
      return { success: false, message: 'Your Golden Sparkler is already glittering brightly!' };
    }

    const updatedInventory = {
      ...current.inventory,
      phooljhadi: sparklerCount - 1,
    };

    soundEngine.playDiyaLight();

    set({
      inventory: updatedInventory,
      sparklerActiveUntil: Date.now() + 12000,
    });

    persistState(get());
    return {
      success: true,
      message: '✨ Golden Sparkler ignited! Twinkling with festival stars for 12 seconds.',
    };
  },

  offerDiyaToShrine: () => {
    const current = get();
    const clayCount = current.inventory['clay_diyas_set'] || 0;
    const legacyCount = current.inventory['earthen_diya'] || 0;

    if (clayCount <= 0 && legacyCount <= 0) {
      soundEngine.playErrorSound();
      return { success: false, message: 'You have no handcrafted clay diyas to offer.' };
    }

    // Deduct from legacy earthen_diya first if present, otherwise clay_diyas_set
    const keyToDeduct = legacyCount > 0 ? 'earthen_diya' : 'clay_diyas_set';
    const count = current.inventory[keyToDeduct] || 0;

    const updatedInventory = {
      ...current.inventory,
      [keyToDeduct]: Math.max(0, count - 1),
    };

    const updatedStats: MiniGameStats = {
      ...current.stats,
      shrineOfferingsCount: (current.stats.shrineOfferingsCount || 0) + 1,
    };

    soundEngine.playDiyaLight();

    set({
      inventory: updatedInventory,
      stats: updatedStats,
    });

    persistState(get());
    return {
      success: true,
      message: '🪔 Sacred Diya offered to the eternal Akhand Jyoti! Auspicious festival blessings received.',
    };
  },

  stopSparkler: () => {
    set({ sparklerActiveUntil: null });
  },

  unlockCosmetic: (cosmeticId: string) => {
    const item = KNOWN_COSMETICS.find((c) => c.id === cosmeticId);
    if (!item) return false;

    const current = get();
    // Prevent duplicate purchases
    if (current.cosmetics.unlocked.includes(cosmeticId)) return false;

    // Check balance sufficiency
    if (current.tokens < item.price) {
      soundEngine.playErrorSound();
      return false;
    }

    const updatedTokens = current.tokens - item.price;
    const updatedUnlocked = [...current.cosmetics.unlocked, cosmeticId];
    // Auto-equip if no cosmetic is currently equipped
    const equipped = current.cosmetics.equipped ?? cosmeticId;

    const updatedHistory: TokenTransaction[] = [
      ...current.tokenHistory,
      {
        id: `cosmetic_${cosmeticId}_${Date.now()}`,
        amount: -item.price,
        source: `Unlocked ${item.name}`,
        timestamp: Date.now(),
      },
    ].slice(-20);

    soundEngine.playPurchaseSuccess();

    set({
      tokens: updatedTokens,
      cosmetics: {
        unlocked: updatedUnlocked,
        equipped,
      },
      tokenHistory: updatedHistory,
      recentTokenDelta: { amount: -item.price, id: String(Date.now()) },
    });
    persistState(get());
    return true;
  },

  equipCosmetic: (cosmeticId: string | null) => {
    const current = get();
    if (cosmeticId !== null && !current.cosmetics.unlocked.includes(cosmeticId)) {
      return false;
    }

    soundEngine.playEquipSound();
    set({
      cosmetics: {
        ...current.cosmetics,
        equipped: cosmeticId,
      },
    });
    persistState(get());
    return true;
  },

  dismissTokenDelta: () => {
    set({ recentTokenDelta: null });
  },

  lightDiya: (diyaId: string) => {
    const current = get();
    if (current.litDiyas.includes(diyaId)) return;

    const updatedLit = [...current.litDiyas, diyaId];
    soundEngine.playDiyaLight();

    const { updatedDaily, justCompletedAll } = applyDailyProgress(current.dailyDarshan, 'light_diyas', 1);
    if (justCompletedAll) soundEngine.playQuestChime();

    // 5 virtual tokens reward for spreading light!
    const reward = 5;
    const updatedTokens = current.tokens + reward;
    const updatedStats: MiniGameStats = {
      ...current.stats,
      diyasLitCount: updatedLit.length,
      totalTokensEarned: (current.stats?.totalTokensEarned ?? current.tokens) + reward,
    };
    const updatedHistory: TokenTransaction[] = [
      ...current.tokenHistory,
      {
        id: `diya_${diyaId}_${Date.now()}`,
        amount: reward,
        source: 'Diya Kindled',
        timestamp: Date.now(),
      },
    ].slice(-20);

    set({
      tokens: updatedTokens,
      litDiyas: updatedLit,
      stats: updatedStats,
      tokenHistory: updatedHistory,
      recentTokenDelta: { amount: reward, id: String(Date.now()) },
      dailyDarshan: updatedDaily,
      questNotification: justCompletedAll
        ? {
            id: `daily_all_completed_${Date.now()}`,
            title: '✨ Daily Darshan Completed!',
            message: 'All 3 daily objectives fulfilled! Claim your +25 🪙 daily set bonus.',
            type: 'completed',
            timestamp: Date.now(),
          }
        : current.questNotification,
    });
    persistState(get());
  },

  completeRangoli: () => {
    const current = get();
    const { updatedDaily, justCompletedAll } = applyDailyProgress(current.dailyDarshan, 'rangoli_art', 1);
    if (justCompletedAll) soundEngine.playQuestChime();

    const dailyNotification = justCompletedAll
      ? {
          id: `daily_all_completed_${Date.now()}`,
          title: '✨ Daily Darshan Completed!',
          message: 'All 3 daily objectives fulfilled! Claim your +25 🪙 daily set bonus.',
          type: 'completed' as const,
          timestamp: Date.now(),
        }
      : current.questNotification;

    if (current.stats.rangoliCompleted) {
      if (updatedDaily !== current.dailyDarshan) {
        set({
          dailyDarshan: updatedDaily,
          questNotification: dailyNotification,
        });
        persistState(get());
      }
      return;
    }

    const reward = 25;
    const updatedTokens = current.tokens + reward;
    const updatedStats: MiniGameStats = {
      ...current.stats,
      rangoliCompleted: true,
      totalTokensEarned: (current.stats?.totalTokensEarned ?? current.tokens) + reward,
    };
    const updatedHistory: TokenTransaction[] = [
      ...current.tokenHistory,
      {
        id: `rangoli_${Date.now()}`,
        amount: reward,
        source: 'Rangoli Artistry',
        timestamp: Date.now(),
      },
    ].slice(-20);

    set({
      tokens: updatedTokens,
      stats: updatedStats,
      tokenHistory: updatedHistory,
      recentTokenDelta: { amount: reward, id: String(Date.now()) },
      dailyDarshan: updatedDaily,
      questNotification: dailyNotification,
    });
    persistState(get());
  },

  collectMagicalDiya: (diyaId: string, diyaName?: string) => {
    const current = get();
    // Guard against duplicate collection
    if (current.quest.collectedDiyas.includes(diyaId)) return false;

    const updatedCollected = [...current.quest.collectedDiyas, diyaId];
    const targetCount = current.quest.targetCount;
    const isNowComplete = updatedCollected.length >= targetCount;
    const justCompleted = isNowComplete && !current.quest.isCompleted;

    // Resonant audio chime upon kindle
    soundEngine.playQuestChime();

    let newTokens = current.tokens;
    let earnedTokens = current.stats?.totalTokensEarned ?? current.tokens;
    let updatedHistory = current.tokenHistory;
    let recentDelta = current.recentTokenDelta;

    if (justCompleted) {
      // Award quest completion bonus tokens!
      const reward = current.quest.rewardTokens;
      newTokens += reward;
      earnedTokens += reward;
      updatedHistory = [
        ...current.tokenHistory,
        {
          id: `quest_${Date.now()}`,
          amount: reward,
          source: 'Sacred Lights Quest Reward',
          timestamp: Date.now(),
        },
      ].slice(-20);
      recentDelta = { amount: reward, id: String(Date.now()) };

      soundEngine.playQuestComplete();
      soundEngine.playTokenEarned();
    }

    const updatedStats: MiniGameStats = {
      ...current.stats,
      totalTokensEarned: earnedTokens,
      magicalDiyasCollected: updatedCollected.length,
      questCompleted: isNowComplete || current.quest.isCompleted,
    };

    const notification: QuestNotification = justCompleted
      ? {
          id: 'quest_completed_' + Date.now(),
          title: '🎉 Quest Complete: Sacred Lights Kindle!',
          message: `All 5 Sacred Diyas illuminated! Awarded +${current.quest.rewardTokens} Festival Tokens.`,
          type: 'completed',
          timestamp: Date.now(),
        }
      : {
          id: `diya_${diyaId}_${Date.now()}`,
          title: '✨ Sacred Diya Kindled!',
          message: `${diyaName || 'Magical Diya'} collected (${updatedCollected.length}/${targetCount})`,
          type: 'collected',
          timestamp: Date.now(),
        };

    set({
      tokens: newTokens,
      stats: updatedStats,
      tokenHistory: updatedHistory,
      recentTokenDelta: recentDelta,
      quest: {
        ...current.quest,
        collectedDiyas: updatedCollected,
        isCompleted: isNowComplete || current.quest.isCompleted,
      },
      questNotification: notification,
    });

    persistState(get());
    return true;
  },

  dismissQuestNotification: () => {
    set({ questNotification: null });
  },

  recordFireworksWatched: () => {
    const current = get();
    const { updatedDaily, justCompletedAll } = applyDailyProgress(current.dailyDarshan, 'visit_attraction', 1);
    if (justCompletedAll) soundEngine.playQuestChime();

    const updatedStats: MiniGameStats = {
      ...current.stats,
      fireworksWatchedCount: (current.stats.fireworksWatchedCount || 0) + 1,
    };

    set({
      stats: updatedStats,
      dailyDarshan: updatedDaily,
      questNotification: justCompletedAll
        ? {
            id: `daily_all_completed_${Date.now()}`,
            title: '✨ Daily Darshan Completed!',
            message: 'All 3 daily objectives fulfilled! Claim your +25 🪙 daily set bonus.',
            type: 'completed',
            timestamp: Date.now(),
          }
        : current.questNotification,
    });
    persistState(get());
  },

  claimDailyBonus: () => {
    const current = get();
    const { dailyDarshan } = current;
    if (!dailyDarshan.isAllCompleted || dailyDarshan.isClaimed) return false;
    if (dailyDarshan.claimedDates.includes(dailyDarshan.date)) return false;

    const reward = DAILY_BONUS_TOKENS;
    const newTokens = current.tokens + reward;
    const earnedTokens = (current.stats?.totalTokensEarned ?? current.tokens) + reward;

    const consecutive = dailyDarshan.lastCompletedDate
      ? isConsecutiveDay(dailyDarshan.lastCompletedDate, dailyDarshan.date)
      : false;
    const newStreak = consecutive ? dailyDarshan.streak + 1 : 1;

    const updatedHistory: TokenTransaction[] = [
      ...current.tokenHistory,
      {
        id: `daily_darshan_${Date.now()}`,
        amount: reward,
        source: 'Festival Darshan Daily Bonus',
        timestamp: Date.now(),
      },
    ].slice(-20);

    const updatedDaily: DailyDarshanState = {
      ...dailyDarshan,
      isClaimed: true,
      streak: newStreak,
      lastCompletedDate: dailyDarshan.date,
      claimedDates: [...dailyDarshan.claimedDates, dailyDarshan.date].slice(-30),
    };

    const updatedStats: MiniGameStats = {
      ...current.stats,
      totalTokensEarned: earnedTokens,
      dailyStreak: newStreak,
      dailySetsCompleted: (current.stats?.dailySetsCompleted || 0) + 1,
    };

    soundEngine.playQuestComplete();
    soundEngine.playTokenEarned();

    set({
      tokens: newTokens,
      stats: updatedStats,
      tokenHistory: updatedHistory,
      recentTokenDelta: { amount: reward, id: String(Date.now()) },
      dailyDarshan: updatedDaily,
      questNotification: {
        id: `daily_claimed_${Date.now()}`,
        title: '🎉 Daily Bonus Claimed! (+25 🪙)',
        message: `Streak: ${newStreak} day${newStreak > 1 ? 's' : ''}! Return tomorrow for fresh challenges!`,
        type: 'completed',
        timestamp: Date.now(),
      },
    });

    persistState(get());
    return true;
  },

  refreshDailyDarshan: (overrideDate?: string) => {
    const current = get();
    const targetDate = overrideDate || getCalendarDateString();
    if (current.dailyDarshan.date === targetDate) return;

    const consecutive = isConsecutiveDay(current.dailyDarshan.date, targetDate);
    const wasClaimed = current.dailyDarshan.isClaimed;
    const newStreak = consecutive && wasClaimed ? current.dailyDarshan.streak : 0;
    const challenges = generateDailyChallenges(targetDate);
    const isClaimed = current.dailyDarshan.claimedDates.includes(targetDate);

    const updatedDaily: DailyDarshanState = {
      date: targetDate,
      challenges,
      isAllCompleted: false,
      isClaimed,
      streak: newStreak,
      lastCompletedDate: current.dailyDarshan.lastCompletedDate,
      claimedDates: current.dailyDarshan.claimedDates,
    };

    set({ dailyDarshan: updatedDaily });
    persistState(get());
  },

  updateSettings: (newSettings) => {
    const merged = { ...get().settings, ...newSettings };
    set({ settings: merged });
    soundEngine.setVolumes(merged.masterVolume, merged.sfxVolume, merged.musicVolume);
    persistState(get());
  },

  resetProgress: async () => {
    const resetData = await saveRepository.reset();
    const today = getCalendarDateString();
    const isTouch = useInputStore.getState().isTouchDevice;
    const resetSettings = {
      ...resetData.settings,
      graphicsQuality: isTouch ? 'medium' : resetData.settings.graphicsQuality,
    };
    set({
      tokens: resetData.tokens,
      inventory: resetData.inventory.items,
      litDiyas: resetData.litDiyas,
      stats: resetData.stats,
      cosmetics: resetData.cosmetics || { unlocked: [], equipped: null },
      tokenHistory: resetData.tokenHistory && resetData.tokenHistory.length > 0
        ? resetData.tokenHistory
        : [
            {
              id: 'welcome_gift',
              amount: resetData.tokens,
              source: 'Festival Welcome Gift',
              timestamp: Date.now(),
            },
          ],
      recentTokenDelta: null,
      sparklerActiveUntil: null,
      settings: resetSettings,
      dailyDarshan: {
        date: today,
        challenges: generateDailyChallenges(today),
        isAllCompleted: false,
        isClaimed: false,
        streak: 0,
        lastCompletedDate: null,
        claimedDates: [],
      },
      quest: {
        id: 'five_sacred_diyas',
        title: 'The Five Sacred Lights',
        description: 'Kindle all 5 Sacred Golden Diyas hidden across the fairground.',
        targetCount: 5,
        collectedDiyas: resetData.quest?.collectedDiyas || [],
        isCompleted: Boolean(resetData.quest?.isCompleted),
        rewardTokens: 50,
      },
      questNotification: null,
      balloonGame: {
        score: 0,
        timeLeft: 30,
        isPlaying: false,
        highScore: 0,
      },
      ringTossGame: {
        score: 0,
        ringsRemaining: 5,
        timeLeft: 30,
        isPlaying: false,
        highScore: 0,
        hitsCount: 0,
      },
    });
    soundEngine.setVolumes(resetSettings.masterVolume, resetSettings.sfxVolume, resetSettings.musicVolume);
  },

  startBalloonGame: () => {
    soundEngine.resume();
    set({
      activeModal: 'balloon_game',
      balloonGame: {
        ...get().balloonGame,
        score: 0,
        timeLeft: 30,
        isPlaying: true,
      },
    });
  },

  recordBalloonHit: (points = 10) => {
    const current = get();
    const { balloonGame } = current;
    if (!balloonGame.isPlaying) return;

    soundEngine.playBalloonPop();
    const newScore = balloonGame.score + points;
    const newHigh = Math.max(newScore, balloonGame.highScore);
    const { updatedDaily, justCompletedAll } = applyDailyProgress(current.dailyDarshan, 'balloon_hits', 1);
    if (justCompletedAll) soundEngine.playQuestChime();

    set({
      balloonGame: {
        ...balloonGame,
        score: newScore,
        highScore: newHigh,
      },
      dailyDarshan: updatedDaily,
      questNotification: justCompletedAll
        ? {
            id: `daily_all_completed_${Date.now()}`,
            title: '✨ Daily Darshan Completed!',
            message: 'All 3 daily objectives fulfilled! Claim your +25 🪙 daily set bonus.',
            type: 'completed',
            timestamp: Date.now(),
          }
        : current.questNotification,
    });
  },

  tickBalloonGame: () => {
    const { balloonGame } = get();
    if (!balloonGame.isPlaying) return;

    if (balloonGame.timeLeft <= 1) {
      get().endBalloonGame();
    } else {
      set({
        balloonGame: {
          ...balloonGame,
          timeLeft: balloonGame.timeLeft - 1,
        },
      });
    }
  },

  endBalloonGame: () => {
    const current = get();
    // Guard against duplicate mini-game completion events!
    if (!current.balloonGame.isPlaying) return;

    const rewardTokens = Math.max(10, Math.floor(current.balloonGame.score / 2));
    soundEngine.playTokenEarned();

    const newTokens = current.tokens + rewardTokens;
    const newHighScore = Math.max(current.balloonGame.highScore, current.balloonGame.score);
    const updatedStats: MiniGameStats = {
      ...current.stats,
      balloonHighScore: newHighScore,
      totalTokensEarned: (current.stats?.totalTokensEarned ?? current.tokens) + rewardTokens,
    };
    const updatedHistory: TokenTransaction[] = [
      ...current.tokenHistory,
      {
        id: `balloon_${Date.now()}`,
        amount: rewardTokens,
        source: 'Balloon Shooting Gallery',
        timestamp: Date.now(),
      },
    ].slice(-20);

    const { updatedDaily, justCompletedAll } = applyDailyProgress(current.dailyDarshan, 'balloon_score', current.balloonGame.score, true);
    if (justCompletedAll) soundEngine.playQuestChime();

    set({
      balloonGame: {
        ...current.balloonGame,
        isPlaying: false,
        highScore: newHighScore,
      },
      tokens: newTokens,
      stats: updatedStats,
      tokenHistory: updatedHistory,
      recentTokenDelta: { amount: rewardTokens, id: String(Date.now()) },
      dailyDarshan: updatedDaily,
      questNotification: justCompletedAll
        ? {
            id: `daily_all_completed_${Date.now()}`,
            title: '✨ Daily Darshan Completed!',
            message: 'All 3 daily objectives fulfilled! Claim your +25 🪙 daily set bonus.',
            type: 'completed',
            timestamp: Date.now(),
          }
        : current.questNotification,
    });
    persistState(get());
  },

  startRingTossGame: () => {
    soundEngine.resume();
    const current = get();
    set({
      activeModal: 'ring_toss',
      ringTossGame: {
        score: 0,
        ringsRemaining: MAX_RING_TOSS_RINGS,
        timeLeft: RING_TOSS_TIME_LIMIT,
        isPlaying: true,
        highScore: current.ringTossGame.highScore,
        hitsCount: 0,
      },
    });
  },

  recordRingTossThrow: (points: number, isHit: boolean) => {
    const current = get();
    const { ringTossGame } = current;
    if (!ringTossGame.isPlaying || ringTossGame.ringsRemaining <= 0) return;

    if (isHit) {
      soundEngine.playDiyaLight();
    } else {
      soundEngine.playShootSound();
    }

    const newRingsRemaining = ringTossGame.ringsRemaining - 1;
    const addedScore = isHit ? Math.max(0, points) : 0;
    const newScore = ringTossGame.score + addedScore;
    const newHits = ringTossGame.hitsCount + (isHit ? 1 : 0);
    const newHigh = Math.max(newScore, ringTossGame.highScore);

    set({
      ringTossGame: {
        ...ringTossGame,
        score: newScore,
        ringsRemaining: newRingsRemaining,
        highScore: newHigh,
        hitsCount: newHits,
      },
    });

    if (newRingsRemaining <= 0) {
      get().endRingTossGame();
    }
  },

  tickRingTossGame: () => {
    const { ringTossGame } = get();
    if (!ringTossGame.isPlaying) return;

    if (ringTossGame.timeLeft <= 1) {
      get().endRingTossGame();
    } else {
      set({
        ringTossGame: {
          ...ringTossGame,
          timeLeft: ringTossGame.timeLeft - 1,
        },
      });
    }
  },

  endRingTossGame: () => {
    const current = get();
    // Guard against duplicate mini-game completion events!
    if (!current.ringTossGame.isPlaying) return;

    const score = current.ringTossGame.score;
    const rewardTokens = calculateRingTossReward(score);

    const newTokens = current.tokens + rewardTokens;
    const newHighScore = Math.max(current.ringTossGame.highScore, score);
    const updatedStats: MiniGameStats = {
      ...current.stats,
      ringTossHighScore: newHighScore,
      totalTokensEarned: (current.stats?.totalTokensEarned ?? current.tokens) + rewardTokens,
    };

    const updatedHistory: TokenTransaction[] = rewardTokens > 0
      ? [
          ...current.tokenHistory,
          {
            id: `ringtoss_${Date.now()}`,
            amount: rewardTokens,
            source: 'Diwali Ring Toss Carnival',
            timestamp: Date.now(),
          },
        ].slice(-20)
      : current.tokenHistory;

    if (rewardTokens > 0) {
      soundEngine.playTokenEarned();
    }

    set({
      ringTossGame: {
        ...current.ringTossGame,
        isPlaying: false,
        highScore: newHighScore,
      },
      tokens: newTokens,
      stats: updatedStats,
      tokenHistory: updatedHistory,
      recentTokenDelta: rewardTokens > 0 ? { amount: rewardTokens, id: String(Date.now()) } : null,
    });

    persistState(get());
  },

  cancelRingTossGame: () => {
    const current = get();
    set({
      activeModal: 'none',
      ringTossGame: {
        ...current.ringTossGame,
        isPlaying: false,
        ringsRemaining: MAX_RING_TOSS_RINGS,
        timeLeft: RING_TOSS_TIME_LIMIT,
      },
    });
  },

  // Attractions: Ferris Wheel
  boardFerrisWheel: (cabinIndex = 0) => {
    const current = get();
    if (current.ferrisWheelRide.isRiding) return;
    set({
      ferrisWheelRide: {
        ...current.ferrisWheelRide,
        isRiding: true,
        cabinIndex,
      },
      activeModal: 'none',
      prompt: null,
    });
  },

  exitFerrisWheel: () => {
    const current = get();
    if (!current.ferrisWheelRide.isRiding) return;
    set({
      ferrisWheelRide: {
        ...current.ferrisWheelRide,
        isRiding: false,
      },
      prompt: null,
    });
  },

  updateFerrisWheelAngle: (angle: number) => {
    const current = get().ferrisWheelRide;
    if (Math.abs(current.rotationAngle - angle) < 0.0001) return;
    set({
      ferrisWheelRide: {
        ...current,
        rotationAngle: angle,
      },
    });
  },

  // Attractions: Cultural Stage
  setStagePlayingMusic: (playing: boolean) => {
    if (playing) {
      soundEngine.resume();
      soundEngine.startFestiveMusic();
    } else {
      soundEngine.stopFestiveMusic();
    }
    set((s) => ({
      culturalStageState: {
        ...s.culturalStageState,
        isPlayingMusic: playing,
      },
    }));
  },

  setStageRaag: (raag: string) => {
    set((s) => ({
      culturalStageState: {
        ...s.culturalStageState,
        activeRaag: raag,
      },
    }));
  },

  setStageLightingTheme: (theme: 'gold' | 'peacock' | 'saffron') => {
    set((s) => ({
      culturalStageState: {
        ...s.culturalStageState,
        lightingTheme: theme,
      },
    }));
  },

  // Attractions: Fireworks
  startScheduledFireworks: () => {
    set((s) => ({
      fireworksState: {
        ...s.fireworksState,
        mode: 'scheduled',
        countdown: 3,
        showTimeRemaining: 20,
      },
    }));
  },

  stopFireworksShow: () => {
    set((s) => ({
      fireworksState: {
        ...s.fireworksState,
        mode: 'idle',
        countdown: 3,
        showTimeRemaining: 20,
      },
    }));
  },

  tickFireworks: () => {
    const current = get();
    if (current.fireworksState.mode !== 'scheduled') return;
    if (current.fireworksState.countdown > 0) {
      set((s) => ({
        fireworksState: {
          ...s.fireworksState,
          countdown: s.fireworksState.countdown - 1,
        },
      }));
    } else if (current.fireworksState.showTimeRemaining > 0) {
      const remaining = current.fireworksState.showTimeRemaining - 1;
      if (remaining === 0) {
        current.addTokens(50, 'Diwali Fireworks Spectacle');
        current.recordFireworksWatched();
      }
      set((s) => ({
        fireworksState: {
          ...s.fireworksState,
          showTimeRemaining: remaining,
          mode: remaining === 0 ? 'idle' : 'scheduled',
        },
      }));
    }
  },

  triggerManualFirework: (burstType = 'peony') => {
    soundEngine.playFireworkExplosion();
    set((s) => ({
      fireworksState: {
        ...s.fireworksState,
        mode: s.fireworksState.mode === 'scheduled' ? 'scheduled' : 'interactive',
        manualLaunchesCount: s.fireworksState.manualLaunchesCount + 1,
        lastManualLaunch: Date.now(),
        lastBurstType: burstType,
      },
    }));
  },
}));
