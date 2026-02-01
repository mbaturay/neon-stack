/**
 * VFX System Types
 * Shared type definitions for all visual effects.
 */

import type * as THREE from 'three';
import type { Axis } from '@/core/types';

/**
 * Configuration constants for VFX timing and appearance.
 * Tweak these values to adjust effect feel.
 */
export const VFX_CONFIG = {
  // Perfect Ring
  PERFECT_RING_DURATION: 350, // ms
  PERFECT_RING_SCALE_START: 1.0,
  PERFECT_RING_SCALE_END: 1.4,
  PERFECT_RING_OPACITY_START: 1.0,
  PERFECT_RING_POOL_SIZE: 4,

  // Slice Flash
  SLICE_FLASH_DURATION: 180, // ms
  SLICE_FLASH_OPACITY_START: 1.0,
  SLICE_FLASH_WIDTH: 0.08, // thickness of line
  SLICE_FLASH_POOL_SIZE: 4,

  // Cut Piece Emissive Fade
  CUT_EMISSIVE_FADE_DURATION: 800, // ms
  CUT_EMISSIVE_START_INTENSITY: 0.5,
  CUT_EMISSIVE_END_INTENSITY: 0.05,

  // Game Over Wash
  GAME_OVER_WASH_DURATION: 600, // ms
  GAME_OVER_FOG_DENSITY: 0.015,
  GAME_OVER_AMBIENT_DIM: 0.15, // target ambient intensity
  GAME_OVER_VIGNETTE_DARKNESS: 0.85,
} as const;

/**
 * Payload for perfect placement effect.
 */
export interface PerfectPayload {
  /** World position of the placed block center */
  position: THREE.Vector3;
  /** Dimensions of the placed block (x, y, z) */
  size: THREE.Vector3;
  /** Y position of block top face */
  topY: number;
}

/**
 * Payload for slice effect.
 */
export interface SlicePayload {
  /** World position of the cut line center */
  cutPosition: THREE.Vector3;
  /** Length of the cut line */
  cutLength: number;
  /** Axis along which the cut was made */
  axis: Axis;
  /** Y position of the cut */
  cutY: number;
}

/**
 * Payload for game over effect.
 */
export interface GameOverPayload {
  /** Final stack height for camera reference */
  stackHeight: number;
}

/**
 * Interface for individual pooled effect instances.
 */
export interface PooledEffect<T extends THREE.Object3D = THREE.Object3D> {
  /** The Three.js object for this effect */
  object: T;
  /** Whether this effect is currently active */
  active: boolean;
  /** Time when effect was triggered (ms) */
  startTime: number;
  /** Duration of the effect (ms) */
  duration: number;
}

/**
 * Base interface for effect classes.
 */
export interface IEffect {
  /** Initialize the effect and add to scene */
  init(scene: THREE.Scene): void;
  /** Update the effect each frame */
  update(deltaMs: number, currentTime: number): void;
  /** Clean up resources */
  dispose(): void;
  /** Update colors when theme changes */
  setColor(color: THREE.Color): void;
}

/**
 * VFX Manager interface for external consumption.
 */
export interface IVFXManager {
  init(scene: THREE.Scene): void;
  update(deltaMs: number): void;
  onPerfect(payload: PerfectPayload): void;
  onSlice(payload: SlicePayload): void;
  onGameOver(payload?: GameOverPayload): void;
  onRestart(): void;
  setThemeColor(color: string): void;
  dispose(): void;
}
