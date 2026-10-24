import { describe, it, expect } from 'vitest';
import {
  validateTokenCredit,
  validateTokenDebit,
  calculateBalloonReward,
  recordPersonalBest,
  isConsumableItem,
  CONSUMABLE_ITEMS,
} from '../systems/economyLogic';

describe('Diwali Mela Economy & Mini-Game Logic', () => {
  describe('Token Credit Validation (addTokens)', () => {
    it('accepts valid positive integer token amounts', () => {
      const res = validateTokenCredit(50, 25);
      expect(res.valid).toBe(true);
      expect(res.newBalance).toBe(75);
    });

    it('rejects zero, negative, or non-finite token additions', () => {
      expect(validateTokenCredit(50, 0).valid).toBe(false);
      expect(validateTokenCredit(50, -10).valid).toBe(false);
      expect(validateTokenCredit(50, NaN).valid).toBe(false);
      expect(validateTokenCredit(50, Infinity).valid).toBe(false);
    });

    it('rejects amounts exceeding safety exploit threshold (>10,000)', () => {
      const res = validateTokenCredit(50, 100000);
      expect(res.valid).toBe(false);
      expect(res.reason).toBe('amount_exceeds_maximum_threshold');
      expect(res.newBalance).toBe(50);
    });

    it('floors fractional token credits', () => {
      const res = validateTokenCredit(10, 15.7);
      expect(res.valid).toBe(true);
      expect(res.newBalance).toBe(25);
    });
  });

  describe('Token Debit Validation (purchaseItem)', () => {
    it('approves purchase when player has sufficient tokens', () => {
      const res = validateTokenDebit(50, 15);
      expect(res.valid).toBe(true);
      expect(res.newBalance).toBe(35);
    });

    it('approves exact balance purchase down to 0 tokens', () => {
      const res = validateTokenDebit(20, 20);
      expect(res.valid).toBe(true);
      expect(res.newBalance).toBe(0);
    });

    it('rejects purchase when player has insufficient tokens and calculates needed difference', () => {
      const res = validateTokenDebit(10, 25);
      expect(res.valid).toBe(false);
      expect(res.reason).toBe('insufficient_funds');
      expect(res.needed).toBe(15);
      expect(res.newBalance).toBe(10); // preserves existing balance
    });

    it('rejects negative or invalid price tags', () => {
      expect(validateTokenDebit(50, -5).valid).toBe(false);
      expect(validateTokenDebit(50, NaN).valid).toBe(false);
    });
  });

  describe('Balloon Shooting Rewards', () => {
    it('calculates reward properly with 10 token baseline', () => {
      expect(calculateBalloonReward(10)).toBe(10);
      expect(calculateBalloonReward(50)).toBe(25);
      expect(calculateBalloonReward(120)).toBe(60);
    });

    it('caps maximum single-round reward at 100 tokens', () => {
      expect(calculateBalloonReward(500)).toBe(100);
    });

    it('returns 0 for negative, zero or NaN scores', () => {
      expect(calculateBalloonReward(0)).toBe(0);
      expect(calculateBalloonReward(-50)).toBe(0);
      expect(calculateBalloonReward(NaN)).toBe(0);
    });
  });

  describe('Personal Best & Local Leaderboard Management', () => {
    it('records first score as new personal record', () => {
      const res = recordPersonalBest([], 45, '2026-10-24');
      expect(res.isNewRecord).toBe(true);
      expect(res.entries).toHaveLength(1);
      expect(res.entries[0].score).toBe(45);
      expect(res.entries[0].date).toBe('2026-10-24');
    });

    it('maintains scores in descending order and trims to top 3', () => {
      const initial = [
        { score: 50, date: '2026-10-20' },
        { score: 40, date: '2026-10-21' },
        { score: 30, date: '2026-10-22' },
      ];

      const res = recordPersonalBest(initial, 65, '2026-10-24', 3);
      expect(res.isNewRecord).toBe(true);
      expect(res.entries).toHaveLength(3);
      expect(res.entries[0].score).toBe(65);
      expect(res.entries[1].score).toBe(50);
      expect(res.entries[2].score).toBe(40);
    });

    it('correctly identifies non-record lower scores', () => {
      const initial = [{ score: 80, date: '2026-10-20' }];
      const res = recordPersonalBest(initial, 45, '2026-10-24');
      expect(res.isNewRecord).toBe(false);
      expect(res.entries[0].score).toBe(80);
      expect(res.entries[1].score).toBe(45);
    });
  });

  describe('Consumable Items Verification', () => {
    it('identifies traditional festival sweets and savory snacks as consumable', () => {
      expect(isConsumableItem('gulab_jamun')).toBe(true);
      expect(isConsumableItem('kaju_katli')).toBe(true);
      expect(isConsumableItem('jalebi')).toBe(true);
      expect(isConsumableItem('motichoor_laddoo')).toBe(true);
      expect(isConsumableItem('samosa_plate')).toBe(true);
      expect(isConsumableItem('masala_chai')).toBe(true);
      expect(isConsumableItem('pani_puri')).toBe(true);
    });

    it('rejects non-consumable keepsakes or invalid ids', () => {
      expect(isConsumableItem('kandil_lantern')).toBe(false);
      expect(isConsumableItem('clay_diyas_set')).toBe(false);
      expect(isConsumableItem('phooljhadi')).toBe(false);
      expect(isConsumableItem('unknown_item')).toBe(false);
    });

    it('contains all required items in CONSUMABLE_ITEMS list', () => {
      expect(CONSUMABLE_ITEMS).toHaveLength(7);
    });
  });
});
