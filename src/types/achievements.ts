export type AchievementCategory = 'exploration' | 'carnival' | 'devotion' | 'culture';

export interface FestivalAchievementConfig {
  id: string;
  title: string;
  hindiTitle: string;
  description: string;
  icon: string;
  rewardTokens: number;
  category: AchievementCategory;
  criteria: {
    type: 'diyas_lit' | 'sacred_diyas' | 'balloon_score' | 'ring_hits' | 'collectibles' | 'stage_enjoyed' | 'fireworks' | 'daily_streak';
    threshold: number;
  };
}

export const FESTIVAL_ACHIEVEMENTS_CONFIG: readonly FestivalAchievementConfig[] = [
  {
    id: 'ach_first_light',
    title: 'First Spark of Devotion',
    hindiTitle: 'प्रथम दीप ज्योति',
    description: 'Kindle your first earthen or sacred golden diya in the fairground.',
    icon: '🪔',
    rewardTokens: 10,
    category: 'devotion',
    criteria: { type: 'diyas_lit', threshold: 1 },
  },
  {
    id: 'ach_all_sacred_diyas',
    title: 'Panch Deepam Illuminator',
    hindiTitle: 'पंच दीप प्रज्वलन',
    description: 'Kindle all 5 Sacred Golden Diyas hidden across the fairground zones.',
    icon: '✨',
    rewardTokens: 30,
    category: 'devotion',
    criteria: { type: 'sacred_diyas', threshold: 5 },
  },
  {
    id: 'ach_carnival_ace',
    title: 'Sharpshooter of the Mela',
    hindiTitle: 'मेला अचूक निशानेबाज',
    description: 'Score 30 or more points in the Balloon Shooting Gallery.',
    icon: '🎯',
    rewardTokens: 20,
    category: 'carnival',
    criteria: { type: 'balloon_score', threshold: 30 },
  },
  {
    id: 'ach_ring_master',
    title: 'Lota Toss Virtuoso',
    hindiTitle: 'रिंग टॉस निपुण',
    description: 'Successfully land 3 or more rings on brass vessels in Ring Toss.',
    icon: '⭕',
    rewardTokens: 20,
    category: 'carnival',
    criteria: { type: 'ring_hits', threshold: 3 },
  },
  {
    id: 'ach_mela_explorer',
    title: 'Curator of Festive Keepsakes',
    hindiTitle: 'मेला धरोहर अन्वेषक',
    description: 'Discover all 4 hidden Festival Keepsakes scattered across the mela.',
    icon: '🗺️',
    rewardTokens: 25,
    category: 'exploration',
    criteria: { type: 'collectibles', threshold: 4 },
  },
  {
    id: 'ach_cultural_connoisseur',
    title: 'Rasika of Sangeet',
    hindiTitle: 'संगीत रसिक',
    description: 'Spend time absorbing classical Hindustani raagas at the Cultural Stage.',
    icon: '🎶',
    rewardTokens: 15,
    category: 'culture',
    criteria: { type: 'stage_enjoyed', threshold: 1 },
  },
  {
    id: 'ach_sky_spectacular',
    title: 'Master of Celestial Sparklers',
    hindiTitle: 'आकाश दीप उत्सव',
    description: 'Witness or launch a grand festive fireworks show in the night sky.',
    icon: '🎆',
    rewardTokens: 20,
    category: 'culture',
    criteria: { type: 'fireworks', threshold: 1 },
  },
  {
    id: 'ach_darshan_devotee',
    title: 'Devoted Festival Sevadar',
    hindiTitle: 'समर्पित सेवादार',
    description: 'Fulfill all 3 daily festival darshan challenges in a single calendar day.',
    icon: '📿',
    rewardTokens: 25,
    category: 'devotion',
    criteria: { type: 'daily_streak', threshold: 1 },
  },
] as const;

export const KNOWN_ACHIEVEMENT_IDS = FESTIVAL_ACHIEVEMENTS_CONFIG.map((a) => a.id);
