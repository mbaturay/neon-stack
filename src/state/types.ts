/**
 * State management types
 */

import type { Block, FallingPiece, Axis, GamePhase } from '@/core/types';

export interface GameState {
  // Game phase
  phase: GamePhase;

  // Stack of placed blocks
  blocks: Block[];

  // Currently moving block (null when game over or idle)
  currentBlock: Block | null;

  // Pending next block (deferred spawn to avoid ghost block flicker)
  pendingNextBlock: Block | null;

  // Which axis the current block moves along (alternates)
  movingAxis: Axis;

  // Game timing (in milliseconds)
  gameTime: number;

  // Scoring
  score: number;
  perfectStreak: number;
  highScore: number;

  // Visual feedback
  fallingPieces: FallingPiece[];
  lastPerfectHit: boolean;

  // Actions
  startGame: () => void;
  dropBlock: () => void;
  tick: (deltaMs: number) => void;
  reset: () => void;
  cleanupFallingPieces: () => void;
  spawnPendingBlock: () => void;
}
