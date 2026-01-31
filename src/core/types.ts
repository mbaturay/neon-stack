/**
 * Core game types - pure data structures with no dependencies
 */

/** 3D vector for positions and dimensions */
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

/** A block in the game world */
export interface Block {
  /** Center position of the block */
  position: Vector3;
  /** Width (x), height (y), depth (z) */
  dimensions: Vector3;
  /** Unique identifier */
  id: string;
}

/** Result of slicing a block against a base */
export interface SliceResult {
  /** The portion that stays on the stack (null if complete miss) */
  kept: Block | null;
  /** The portion that falls off (null if perfect hit) */
  fallen: Block | null;
  /** True if the hit was within perfect tolerance */
  isPerfect: boolean;
}

/** Axis along which blocks move */
export type Axis = 'x' | 'z';

/** Game phase states */
export type GamePhase = 'idle' | 'playing' | 'gameover';

/** A piece that is falling off after a slice */
export interface FallingPiece {
  id: string;
  block: Block;
  velocity: Vector3;
  angularVelocity: Vector3;
  createdAt: number;
}

/** Game constants */
export const GAME_CONSTANTS = {
  /** Height of each block */
  BLOCK_HEIGHT: 0.5,
  /** Initial block size (width and depth) */
  INITIAL_BLOCK_SIZE: 3,
  /** Perfect hit tolerance (units) */
  PERFECT_TOLERANCE: 0.1,
  /** Block oscillation amplitude */
  OSCILLATION_AMPLITUDE: 4,
  /** Block oscillation speed (radians per second) */
  OSCILLATION_SPEED: 2,
  /** Gravity for falling pieces */
  GRAVITY: -20,
  /** Falling piece lifetime (ms) */
  FALLING_PIECE_LIFETIME: 2000,
  /** Points for regular hit */
  POINTS_PER_HIT: 10,
  /** Bonus multiplier per perfect streak */
  PERFECT_STREAK_MULTIPLIER: 2,
} as const;
