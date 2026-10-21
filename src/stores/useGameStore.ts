import { create } from 'zustand';
import type { GameZone, InteractionPromptState, ShopItem, GraphicsQuality } from '../types/game';
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
  updateSettings: (newSettings: Partial<GameState['settings']>) => void;
  resetProgress: () => Promise<void>;

  // Mini-game actions
  startBalloonGame: () => void;
  recordBalloonHit: (points?: number) => void;
  tickBalloonGame: () => void;
  endBalloonGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  isLoaded: false,
  gameStarted: false,
  currentZone: 'entrance',
  tokens: 50,
  inventory: { 'gulab_jamun': 1, 'earthen_diya': 5 },
  litDiyas: [],
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
    const data = await saveRepository.load();
    set({
      tokens: data.tokens,
      inventory: data.inventory.items,
      litDiyas: data.litDiyas,
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
    const newTokens = get().tokens + amount;
    soundEngine.playTokenEarned();
    set({ tokens: newTokens });
    // persist
    const current = get();
    saveRepository.save({
      version: 1,
      tokens: newTokens,
      inventory: { items: current.inventory },
      litDiyas: current.litDiyas,
      stats: {
        balloonHighScore: current.balloonGame.highScore,
        ringTossHighScore: current.ringTossGame.highScore,
        diyasLitCount: current.litDiyas.length,
        rangoliCompleted: false,
        totalTokensEarned: newTokens,
        fireworksWatchedCount: 0,
      },
      settings: current.settings,
      lastSavedAt: Date.now(),
    });
  },

  purchaseItem: (itemId: string) => {
    const item = SHOP_CATALOG.find((i) => i.id === itemId);
    if (!item) return false;

    const { tokens, inventory } = get();
    if (tokens < item.price) return false;

    const updatedTokens = tokens - item.price;
    const updatedInventory = {
      ...inventory,
      [itemId]: (inventory[itemId] || 0) + 1,
    };

    soundEngine.playTokenEarned();

    set({
      tokens: updatedTokens,
      inventory: updatedInventory,
    });

    const current = get();
    saveRepository.save({
      version: 1,
      tokens: updatedTokens,
      inventory: { items: updatedInventory },
      litDiyas: current.litDiyas,
      stats: {
        balloonHighScore: current.balloonGame.highScore,
        ringTossHighScore: current.ringTossGame.highScore,
        diyasLitCount: current.litDiyas.length,
        rangoliCompleted: false,
        totalTokensEarned: updatedTokens,
        fireworksWatchedCount: 0,
      },
      settings: current.settings,
      lastSavedAt: Date.now(),
    });

    return true;
  },

  lightDiya: (diyaId: string) => {
    const { litDiyas } = get();
    if (litDiyas.includes(diyaId)) return;

    const updatedLit = [...litDiyas, diyaId];
    soundEngine.playDiyaLight();
    get().addTokens(5); // 5 virtual tokens reward for spreading light!

    set({ litDiyas: updatedLit });

    const current = get();
    saveRepository.save({
      version: 1,
      tokens: current.tokens,
      inventory: { items: current.inventory },
      litDiyas: updatedLit,
      stats: {
        balloonHighScore: current.balloonGame.highScore,
        ringTossHighScore: current.ringTossGame.highScore,
        diyasLitCount: updatedLit.length,
        rangoliCompleted: false,
        totalTokensEarned: current.tokens,
        fireworksWatchedCount: 0,
      },
      settings: current.settings,
      lastSavedAt: Date.now(),
    });
  },

  updateSettings: (newSettings) => {
    const merged = { ...get().settings, ...newSettings };
    set({ settings: merged });
    soundEngine.setVolumes(merged.masterVolume, merged.sfxVolume, merged.musicVolume);

    const current = get();
    saveRepository.save({
      version: 1,
      tokens: current.tokens,
      inventory: { items: current.inventory },
      litDiyas: current.litDiyas,
      stats: {
        balloonHighScore: current.balloonGame.highScore,
        ringTossHighScore: current.ringTossGame.highScore,
        diyasLitCount: current.litDiyas.length,
        rangoliCompleted: false,
        totalTokensEarned: current.tokens,
        fireworksWatchedCount: 0,
      },
      settings: merged,
      lastSavedAt: Date.now(),
    });
  },

  resetProgress: async () => {
    const resetData = await saveRepository.reset();
    set({
      tokens: resetData.tokens,
      inventory: resetData.inventory.items,
      litDiyas: resetData.litDiyas,
      settings: resetData.settings,
      balloonGame: {
        score: 0,
        timeLeft: 30,
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
    const { balloonGame, tokens, inventory, litDiyas, settings } = get();
    const rewardTokens = Math.max(10, Math.floor(balloonGame.score / 2));
    soundEngine.playTokenEarned();

    set({
      balloonGame: {
        ...balloonGame,
        isPlaying: false,
      },
      tokens: tokens + rewardTokens,
    });

    saveRepository.save({
      version: 1,
      tokens: tokens + rewardTokens,
      inventory: { items: inventory },
      litDiyas,
      stats: {
        balloonHighScore: balloonGame.highScore,
        ringTossHighScore: 0,
        diyasLitCount: litDiyas.length,
        rangoliCompleted: false,
        totalTokensEarned: tokens + rewardTokens,
        fireworksWatchedCount: 0,
      },
      settings,
      lastSavedAt: Date.now(),
    });
  },
}));
