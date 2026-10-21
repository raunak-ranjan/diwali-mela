export type CosmeticRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type CosmeticCategory = 'aura' | 'companion' | 'trail' | 'crown';

export interface CosmeticItem {
  id: string;
  name: string;
  hindiName: string;
  description: string;
  category: CosmeticCategory;
  price: number;
  unlockCondition: string;
  rarity: CosmeticRarity;
  icon: string;
}

export interface TokenTransaction {
  id: string;
  amount: number; // positive for earned, negative for spent
  source: string;
  timestamp: number;
}

export interface PlayerCosmetics {
  unlocked: string[];
  equipped: string | null;
}

export const KNOWN_COSMETICS: readonly CosmeticItem[] = [
  {
    id: 'swarna_aura',
    name: 'Swarna Aura',
    hindiName: 'स्वर्ण आभा',
    description: 'A radiant golden mandala pulsates gently beneath your feet as you tread the sacred fairgrounds.',
    category: 'aura',
    price: 30,
    unlockCondition: 'Available in the Festival Wardrobe for 30 Tokens',
    rarity: 'rare',
    icon: '✨',
  },
  {
    id: 'deepam_companion',
    name: 'Deepam Companion',
    hindiName: 'दीपक साथी',
    description: 'A floating celestial golden diya orbits gently near your shoulder, casting warm festive light.',
    category: 'companion',
    price: 50,
    unlockCondition: 'Kindle Sacred Lights or save 50 Tokens',
    rarity: 'epic',
    icon: '🪔',
  },
  {
    id: 'genda_trail',
    name: 'Genda Floral Trail',
    hindiName: 'गेंदा पुष्प मार्ग',
    description: 'Luminous marigold petals and warm stardust cascade gracefully behind you as you walk.',
    category: 'trail',
    price: 80,
    unlockCondition: 'Earn 80 Tokens from games and mela festivities',
    rarity: 'legendary',
    icon: '🌼',
  },
  {
    id: 'surya_mukut',
    name: 'Surya Mukut',
    hindiName: 'सूर्य मुकुट',
    description: 'An auspicious sunburst crown of golden rays shines proudly above your pagri.',
    category: 'crown',
    price: 120,
    unlockCondition: 'Attain 120 Tokens to claim this royal festive crown',
    rarity: 'legendary',
    icon: '👑',
  },
] as const;

export const KNOWN_COSMETIC_IDS = KNOWN_COSMETICS.map((c) => c.id);
