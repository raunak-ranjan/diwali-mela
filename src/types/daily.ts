export type ChallengeType =
  | 'light_diyas'
  | 'balloon_score'
  | 'balloon_hits'
  | 'visit_attraction'
  | 'taste_sweet'
  | 'rangoli_art';

export interface DailyChallengeTemplate {
  id: string;
  type: ChallengeType;
  title: string;
  hindiTitle: string;
  description: string;
  target: number;
  icon: string;
}

export interface ActiveDailyChallenge {
  id: string;
  type: ChallengeType;
  title: string;
  hindiTitle: string;
  description: string;
  target: number;
  current: number;
  isCompleted: boolean;
  icon: string;
}

export interface DailyDarshanState {
  date: string; // YYYY-MM-DD
  challenges: ActiveDailyChallenge[];
  isAllCompleted: boolean;
  isClaimed: boolean;
  streak: number;
  lastCompletedDate: string | null;
  claimedDates: string[]; // Bounded list of dates (last 30) where bonus was claimed
}

export interface DailyDarshanSaveState {
  date: string;
  progress: Record<string, number>; // challengeId -> current progress
  isClaimed: boolean;
  streak: number;
  lastCompletedDate: string | null;
  claimedDates: string[];
}

export const DAILY_BONUS_TOKENS = 25;

export const CHALLENGE_TEMPLATES: readonly DailyChallengeTemplate[] = [
  {
    id: 'ch_light_diyas',
    type: 'light_diyas',
    title: 'Deepam Seva',
    hindiTitle: 'दीपक सेवा',
    description: 'Kindle 3 earthen diyas along the festival lanes.',
    target: 3,
    icon: '🪔',
  },
  {
    id: 'ch_balloon_score',
    type: 'balloon_score',
    title: 'Carnival Marksman',
    hindiTitle: 'निशानेबाज',
    description: 'Score 80 or more points in the Balloon Shooting Gallery.',
    target: 80,
    icon: '🎯',
  },
  {
    id: 'ch_balloon_hits',
    type: 'balloon_hits',
    title: 'Festive Balloon Popper',
    hindiTitle: 'गुब्बारा फोड़',
    description: 'Pop 6 balloons at the carnival shooting stall.',
    target: 6,
    icon: '🎈',
  },
  {
    id: 'ch_visit_attraction',
    type: 'visit_attraction',
    title: 'Mela Sightseer',
    hindiTitle: 'मेला भ्रमण',
    description: 'Ride the Giant Ferris Wheel or visit the Sangeet Stage.',
    target: 1,
    icon: '🎡',
  },
  {
    id: 'ch_taste_sweet',
    type: 'taste_sweet',
    title: 'Bazaar Connoisseur',
    hindiTitle: 'बाज़ार दर्शन',
    description: 'Purchase a sweet treat or handicraft from the stalls.',
    target: 1,
    icon: '🛍️',
  },
  {
    id: 'ch_rangoli_art',
    type: 'rangoli_art',
    title: 'Rangoli Artisan',
    hindiTitle: 'रंगोली रचना',
    description: 'Decorate the central ceremonial plaza with traditional rangoli colors.',
    target: 1,
    icon: '🎨',
  },
] as const;

/**
 * Deterministically hashes a calendar date string (YYYY-MM-DD) to a positive 32-bit integer.
 */
export function hashDateString(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Formats a Date object to YYYY-MM-DD in local time.
 */
export function getCalendarDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Deterministically generates the 3 daily challenges for any given YYYY-MM-DD string.
 */
export function generateDailyChallenges(dateStr: string): ActiveDailyChallenge[] {
  const seed = hashDateString(dateStr);
  const pool = [...CHALLENGE_TEMPLATES];
  const selected: DailyChallengeTemplate[] = [];

  for (let i = 0; i < 3; i++) {
    const idx = (seed + i * 7 + (i * i * 3)) % pool.length;
    selected.push(pool.splice(idx, 1)[0]);
  }

  return selected.map((tpl) => ({
    id: tpl.id,
    type: tpl.type,
    title: tpl.title,
    hindiTitle: tpl.hindiTitle,
    description: tpl.description,
    target: tpl.target,
    current: 0,
    isCompleted: false,
    icon: tpl.icon,
  }));
}

/**
 * Checks whether two YYYY-MM-DD strings are consecutive calendar days.
 */
export function isConsecutiveDay(prevDateStr: string, currDateStr: string): boolean {
  if (!prevDateStr || !currDateStr) return false;
  try {
    const [py, pm, pd] = prevDateStr.split('-').map(Number);
    const [cy, cm, cd] = currDateStr.split('-').map(Number);
    const pDate = new Date(Date.UTC(py, pm - 1, pd));
    const cDate = new Date(Date.UTC(cy, cm - 1, cd));
    const diffMs = cDate.getTime() - pDate.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    return diffDays === 1;
  } catch {
    return false;
  }
}
