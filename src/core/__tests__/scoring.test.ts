import { describe, it, expect } from 'vitest';
import {
  calculateHitScore,
  updatePerfectStreak,
  formatScore,
  getStreakMessage,
} from '../scoring';
import { GAME_CONSTANTS } from '../types';

describe('scoring', () => {
  describe('calculateHitScore', () => {
    const basePoints = GAME_CONSTANTS.POINTS_PER_HIT;

    it('returns base points for non-perfect hit', () => {
      expect(calculateHitScore(0, false)).toBe(basePoints);
      expect(calculateHitScore(5, false)).toBe(basePoints);
    });

    it('returns base points for first perfect hit (streak 0)', () => {
      expect(calculateHitScore(0, true)).toBe(basePoints);
    });

    it('doubles points for second consecutive perfect hit', () => {
      expect(calculateHitScore(1, true)).toBe(basePoints * 2);
    });

    it('quadruples points for third consecutive perfect hit', () => {
      expect(calculateHitScore(2, true)).toBe(basePoints * 4);
    });

    it('scales exponentially with streak', () => {
      expect(calculateHitScore(3, true)).toBe(basePoints * 8);
      expect(calculateHitScore(4, true)).toBe(basePoints * 16);
    });
  });

  describe('updatePerfectStreak', () => {
    it('increments streak on perfect hit', () => {
      expect(updatePerfectStreak(0, true)).toBe(1);
      expect(updatePerfectStreak(5, true)).toBe(6);
    });

    it('resets streak to 0 on non-perfect hit', () => {
      expect(updatePerfectStreak(0, false)).toBe(0);
      expect(updatePerfectStreak(10, false)).toBe(0);
    });
  });

  describe('formatScore', () => {
    it('formats small numbers without commas', () => {
      expect(formatScore(0)).toBe('0');
      expect(formatScore(999)).toBe('999');
    });

    it('formats large numbers with commas', () => {
      expect(formatScore(1000)).toBe('1,000');
      expect(formatScore(1234567)).toBe('1,234,567');
    });
  });

  describe('getStreakMessage', () => {
    it('returns null for streak less than 2', () => {
      expect(getStreakMessage(0)).toBeNull();
      expect(getStreakMessage(1)).toBeNull();
    });

    it('returns DOUBLE for streak of 2', () => {
      expect(getStreakMessage(2)).toBe('DOUBLE');
    });

    it('returns TRIPLE for streak of 3', () => {
      expect(getStreakMessage(3)).toBe('TRIPLE');
    });

    it('returns QUAD for streak of 4', () => {
      expect(getStreakMessage(4)).toBe('QUAD');
    });

    it('returns PENTA for streak of 5', () => {
      expect(getStreakMessage(5)).toBe('PENTA');
    });

    it('returns numbered combo for streak 6+', () => {
      expect(getStreakMessage(6)).toBe('6x COMBO!');
      expect(getStreakMessage(10)).toBe('10x COMBO!');
    });
  });
});
