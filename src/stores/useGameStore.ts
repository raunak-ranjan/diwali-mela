import { create } from 'zustand';
import type { GameZone, InteractionPromptState, ShopItem, GraphicsQuality, MiniGameStats } from '../types/game';
import { saveRepository } from '../systems/saveRepository';
import { soundEngine } from '../audio/soundEngine';

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

export type ActiveModalType = 
  | 'none'
  | 'welcome'
  | 'balloon_game'
  | 'ring_toss'
  | 'shop'
  | 'rangoli'
  | 'finale'
  | 'settings'
  | 'pause';

interface GameState {
  isLoaded: boolean;
  gameStarted: boolean;
  currentZone: GameZone;
  tokens: number;
  inventory: Record<string, number>;
  litDiyas: string[];
  stats: MiniGameStats;
  activeModal: ActiveModalType;
  prompt: InteractionPromptState | null;
  balloonGame: {
    score: number;
    timeLeft: number;
    isPlaying: boolean;
    highScore: number;
  };
  ringTossGame: {
    score: number;
    ringsRemaining: number;
    isPlaying: boolean;
    highScore: number;
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
  addTokens: (amount: number) => void;
  purchaseItem: (itemId: string) => boolean;
  lightDiya: (diyaId: string) => void;
  completeRangoli: () => void;
  recordFireworksWatched: () => void;
  updateSettings: (newSettings: Partial<GameState['settings']>) => void;
  resetProgress: () => Promise<void>;

  // Mini-game actions
  startBalloonGame: () => void;
  recordBalloonHit: (points?: number) => void;
  tickBalloonGame: () => void;
  endBalloonGame: () => void;
}

const persistState = (current: GameState) => {
  saveRepository.save({
    version: 1,
    tokens: current.tokens,
    inventory: { items: current.inventory },
    litDiyas: current.litDiyas,
    stats: current.stats,
    settings: current.settings,
    lastSavedAt: Date.now(),
  });
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
  },
  activeModal: 'welcome',
  prompt: null,
  balloonGame: {
    score: 0,
    timeLeft: 30,
    isPlaying: false,
    highScore: 0,
  },
  ringTossGame: {
    score: 0,
    ringsRemaining: 5,
    isPlaying: false,
    highScore: 0,
  },
  settings: {
    graphicsQuality: 'high',
    masterVolume: 0.8,
    sfxVolume: 0.8,
    musicVolume: 0.6,
    touchSensitivity: 1.0,
    reducedMotion: false,
  },

  initializeSave: async () => {
    try {
      const data = await saveRepository.load();
      set({
        tokens: data.tokens,
        inventory: data.inventory.items,
        litDiyas: data.litDiyas,
        stats: data.stats,
        settings: data.settings,
        balloonGame: {
          score: 0,
          timeLeft: 30,
          isPlaying: false,
          highScore: data.stats.balloonHighScore || 0,
        },
        ringTossGame: {
          score: 0,
          ringsRemaining: 5,
          isPlaying: false,
          highScore: data.stats.ringTossHighScore || 0,
        },
        isLoaded: true,
      });
      soundEngine.setVolumes(data.settings.masterVolume, data.settings.sfxVolume, data.settings.musicVolume);
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
    set({ currentZone: zone });
  },

  setPrompt: (prompt) => {
    set({ prompt });
  },

  openModal: (modal: ActiveModalType) => {
    set({ activeModal: modal });
  },

  closeModal: () => {
    set({ activeModal: 'none' });
  },

  addTokens: (amount: number) => {
    if (amount <= 0 || isNaN(amount)) return;
    const current = get();
    const newTokens = current.tokens + amount;
    const newStats: MiniGameStats = {
      ...current.stats,
      totalTokensEarned: (current.stats?.totalTokensEarned ?? current.tokens) + amount,
    };
    soundEngine.playTokenEarned();
    set({ tokens: newTokens, stats: newStats });
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

    soundEngine.playTokenEarned();

    set({
      tokens: updatedTokens,
      inventory: updatedInventory,
    });
    persistState(get());
    return true;
  },

  lightDiya: (diyaId: string) => {
    const current = get();
    if (current.litDiyas.includes(diyaId)) return;

    const updatedLit = [...current.litDiyas, diyaId];
    soundEngine.playDiyaLight();

    // 5 virtual tokens reward for spreading light!
    const reward = 5;
    const updatedTokens = current.tokens + reward;
    const updatedStats: MiniGameStats = {
      ...current.stats,
      diyasLitCount: updatedLit.length,
      totalTokensEarned: (current.stats?.totalTokensEarned ?? current.tokens) + reward,
    };

    set({
      tokens: updatedTokens,
      litDiyas: updatedLit,
      stats: updatedStats,
    });
    persistState(get());
  },

  completeRangoli: () => {
    const current = get();
    if (current.stats.rangoliCompleted) return;

    const reward = 25;
    const updatedTokens = current.tokens + reward;
    const updatedStats: MiniGameStats = {
      ...current.stats,
      rangoliCompleted: true,
      totalTokensEarned: (current.stats?.totalTokensEarned ?? current.tokens) + reward,
    };

    set({
      tokens: updatedTokens,
      stats: updatedStats,
    });
    persistState(get());
  },

  recordFireworksWatched: () => {
    const current = get();
    const updatedStats: MiniGameStats = {
      ...current.stats,
      fireworksWatchedCount: (current.stats.fireworksWatchedCount || 0) + 1,
    };

    set({ stats: updatedStats });
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
    set({
      tokens: resetData.tokens,
      inventory: resetData.inventory.items,
      litDiyas: resetData.litDiyas,
      stats: resetData.stats,
      settings: resetData.settings,
      balloonGame: {
        score: 0,
        timeLeft: 30,
        isPlaying: false,
        highScore: 0,
      },
      ringTossGame: {
        score: 0,
        ringsRemaining: 5,
        isPlaying: false,
        highScore: 0,
      },
    });
    soundEngine.setVolumes(resetData.settings.masterVolume, resetData.settings.sfxVolume, resetData.settings.musicVolume);
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
    const { balloonGame } = get();
    if (!balloonGame.isPlaying) return;

    soundEngine.playBalloonPop();
    const newScore = balloonGame.score + points;
    const newHigh = Math.max(newScore, balloonGame.highScore);

    set({
      balloonGame: {
        ...balloonGame,
        score: newScore,
        highScore: newHigh,
      },
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

    set({
      balloonGame: {
        ...current.balloonGame,
        isPlaying: false,
        highScore: newHighScore,
      },
      tokens: newTokens,
      stats: updatedStats,
    });
    persistState(get());
  },
}));
