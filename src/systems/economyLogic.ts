/**
 * Pure deterministic mathematics and business logic for the Diwali Mela economy:
 * - Currency transaction safety & validation (no NaN, non-finite, negative balances)
 * - Purchase verification and inventory transactions
 * - Mini-game reward calculations and idempotency
 * - Local personal best & leaderboard management
 * - Consumable festival items verification
 */

import type { LeaderboardEntry } from '../types/game';

export const CONSUMABLE_ITEMS = [
  'gulab_jamun',
  'kaju_katli',
  'jalebi',
  'motichoor_laddoo',
  'samosa_plate',
  'masala_chai',
  'pani_puri',
] as const;

export type ConsumableItemId = (typeof CONSUMABLE_ITEMS)[number];

export function isConsumableItem(itemId: string): itemId is ConsumableItemId {
  return (CONSUMABLE_ITEMS as readonly string[]).includes(itemId);
}

/**
 * Validates and calculates a token credit transaction.
 * Strictly prevents NaN, non-finite, non-positive, or absurdly large exploits.
 */
export function validateTokenCredit(
  currentTokens: number,
  amount: number
): { valid: boolean; newBalance: number; reason?: string } {
  if (typeof currentTokens !== 'number' || !Number.isFinite(currentTokens) || currentTokens < 0) {
    return { valid: false, newBalance: 0, reason: 'invalid_current_balance' };
  }
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0 || isNaN(amount)) {
    return { valid: false, newBalance: currentTokens, reason: 'invalid_credit_amount' };
  }
  if (amount > 10000) {
    return { valid: false, newBalance: currentTokens, reason: 'amount_exceeds_maximum_threshold' };
  }

  const roundedAmount = Math.floor(amount);
  return {
    valid: true,
    newBalance: currentTokens + roundedAmount,
  };
}

/**
 * Validates and calculates a token debit (purchase) transaction.
 * Ensures the player has sufficient funds and cannot enter negative balance.
 */
export function validateTokenDebit(
  currentTokens: number,
  price: number
): { valid: boolean; newBalance: number; needed?: number; reason?: string } {
  if (typeof currentTokens !== 'number' || !Number.isFinite(currentTokens) || currentTokens < 0) {
    return { valid: false, newBalance: 0, reason: 'invalid_current_balance' };
  }
  if (typeof price !== 'number' || !Number.isFinite(price) || price < 0 || isNaN(price)) {
    return { valid: false, newBalance: currentTokens, reason: 'invalid_price' };
  }

  const roundedPrice = Math.floor(price);
  if (currentTokens < roundedPrice) {
    return {
      valid: false,
      newBalance: currentTokens,
      needed: roundedPrice - currentTokens,
      reason: 'insufficient_funds',
    };
  }

  return {
    valid: true,
    newBalance: currentTokens - roundedPrice,
  };
}

/**
 * Computes carnival balloon gallery token reward.
 * Awards base participation (10 tokens) plus 1 token per 2 points scored.
 */
export function calculateBalloonReward(score: number): number {
  if (typeof score !== 'number' || !Number.isFinite(score) || score <= 0 || isNaN(score)) {
    return 0;
  }
  return Math.min(100, Math.max(10, Math.floor(score / 2)));
}

/**
 * Manages local personal bests and leaderboard entries.
 * Inserts new score in descending order, trims to maxEntries, and flags new high scores.
 */
export function recordPersonalBest(
  existing: LeaderboardEntry[] = [],
  newScore: number,
  dateStr?: string,
  maxEntries: number = 3
): { entries: LeaderboardEntry[]; isNewRecord: boolean } {
  if (typeof newScore !== 'number' || !Number.isFinite(newScore) || newScore <= 0 || isNaN(newScore)) {
    return { entries: [...existing], isNewRecord: false };
  }

  const validExisting = Array.isArray(existing)
    ? existing.filter((e) => typeof e?.score === 'number' && Number.isFinite(e.score))
    : [];

  const currentHighScore = validExisting.length > 0 ? validExisting[0].score : 0;
  const isNewRecord = newScore > currentHighScore;

  const entryDate = dateStr || new Date().toISOString().split('T')[0];
  const newEntry: LeaderboardEntry = {
    score: Math.floor(newScore),
    date: entryDate,
  };

  const updated = [...validExisting, newEntry]
    .sort((a, b) => b.score - a.score)
    .slice(0, maxEntries);

  return {
    entries: updated,
    isNewRecord,
  };
}
