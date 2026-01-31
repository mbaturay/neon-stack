/**
 * Pure scoring functions.
 */

import { GAME_CONSTANTS } from './types';

/**
 * Calculate score for a single hit.
 * @param perfectStreak - Current streak of consecutive perfect hits
 * @param isPerfect - Whether this hit was perfect
 * @returns Points earned for this hit
 */
export function calculateHitScore(
  perfectStreak: number,
  isPerfect: boolean
): number {
  const basePoints = GAME_CONSTANTS.POINTS_PER_HIT;

  if (!isPerfect) {
    return basePoints;
  }

  // Perfect hits multiply based on streak
  // Streak 0 (first perfect): 1x multiplier
  // Streak 1: 2x multiplier
  // Streak 2: 4x multiplier
  // etc.
  const multiplier = Math.pow(GAME_CONSTANTS.PERFECT_STREAK_MULTIPLIER, perfectStreak);
  return basePoints * multiplier;
}

/**
 * Calculate the new perfect streak after a hit.
 */
export function updatePerfectStreak(
  currentStreak: number,
  isPerfect: boolean
): number {
  if (isPerfect) {
    return currentStreak + 1;
  }
  return 0; // Reset on non-perfect hit
}

/**
 * Format score for display (with commas).
 */
export function formatScore(score: number): string {
  return score.toLocaleString();
}

/**
 * Get a message based on perfect streak.
 */
export function getStreakMessage(streak: number): string | null {
  if (streak < 2) return null;

  const messages: Record<number, string> = {
    2: 'DOUBLE',
    3: 'TRIPLE',
    4: 'QUAD',
    5: 'PENTA',
  };

  if (streak >= 6) {
    return `${streak}x COMBO!`;
  }

  return messages[streak] ?? null;
}
