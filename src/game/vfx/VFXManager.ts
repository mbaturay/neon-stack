/**
 * VFX Manager
 * Central controller for all visual effects in the game.
 * Handles initialization, updates, theme color changes, and event triggers.
 */

import * as THREE from 'three';
import type {
  IVFXManager,
  PerfectPayload,
  SlicePayload,
  GameOverPayload,
} from './types';
import { PerfectRing } from './effects/PerfectRing';
import { SliceFlash } from './effects/SliceFlash';
import { GameOverWash } from './effects/GameOverWash';

/**
 * Debug flag for development testing.
 * When enabled, allows triggering effects via keyboard.
 */
const VFX_DEBUG = import.meta.env.DEV && false; // Set to true for dev testing

class VFXManagerImpl implements IVFXManager {
  private initialized: boolean = false;
  private currentTime: number = 0;

  // Effect instances
  private perfectRing: PerfectRing;
  private sliceFlash: SliceFlash;
  private gameOverWash: GameOverWash;

  // Current theme color for all effects
  private themeColor: THREE.Color;

  constructor() {
    this.perfectRing = new PerfectRing();
    this.sliceFlash = new SliceFlash();
    this.gameOverWash = new GameOverWash();
    this.themeColor = new THREE.Color(0x00f6ff); // Default cyan
  }

  /**
   * Initialize all effects and add them to the scene.
   */
  init(scene: THREE.Scene): void {
    if (this.initialized) {
      console.warn('VFXManager already initialized');
      return;
    }

    // Initialize all effects
    this.perfectRing.init(scene);
    this.sliceFlash.init(scene);
    this.gameOverWash.init(scene);

    // Apply initial theme color
    this.perfectRing.setColor(this.themeColor);
    this.sliceFlash.setColor(this.themeColor);

    this.initialized = true;

    // Debug keyboard handler
    if (VFX_DEBUG) {
      this.setupDebugControls();
    }
  }

  /**
   * Update all active effects.
   * @param deltaMs Time since last frame in milliseconds
   */
  update(deltaMs: number): void {
    if (!this.initialized) return;

    this.currentTime += deltaMs;

    this.perfectRing.update(deltaMs, this.currentTime);
    this.sliceFlash.update(deltaMs, this.currentTime);
    this.gameOverWash.update(deltaMs, this.currentTime);
  }

  /**
   * Trigger perfect placement effect.
   */
  onPerfect(payload: PerfectPayload): void {
    if (!this.initialized) return;
    this.perfectRing.trigger(payload);
  }

  /**
   * Trigger slice flash effect.
   */
  onSlice(payload: SlicePayload): void {
    if (!this.initialized) return;
    this.sliceFlash.trigger(payload);
  }

  /**
   * Trigger game over wash effect.
   */
  onGameOver(payload?: GameOverPayload): void {
    if (!this.initialized) return;
    this.gameOverWash.trigger(payload);
  }

  /**
   * Reset effects on game restart.
   */
  onRestart(): void {
    if (!this.initialized) return;
    this.gameOverWash.reverse();
  }

  /**
   * Update theme color for all effects.
   * @param color CSS color string (e.g., '#00F6FF')
   */
  setThemeColor(color: string): void {
    this.themeColor.set(color);

    if (this.initialized) {
      this.perfectRing.setColor(this.themeColor);
      this.sliceFlash.setColor(this.themeColor);
    }
  }

  /**
   * Clean up all resources.
   */
  dispose(): void {
    if (!this.initialized) return;

    this.perfectRing.dispose();
    this.sliceFlash.dispose();
    this.gameOverWash.dispose();

    this.initialized = false;
  }

  /**
   * Debug controls for testing effects during development.
   */
  private setupDebugControls(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', (e) => {
      // Only in debug mode
      if (!VFX_DEBUG) return;

      switch (e.key) {
        case 'p': // Test perfect ring
          this.onPerfect({
            position: new THREE.Vector3(0, 2, 0),
            size: new THREE.Vector3(3, 0.5, 3),
            topY: 2.25,
          });
          console.log('[VFX Debug] Perfect ring triggered');
          break;

        case 's': // Test slice flash
          this.onSlice({
            cutPosition: new THREE.Vector3(1, 2, 0),
            cutLength: 3,
            axis: 'x',
            cutY: 2.25,
          });
          console.log('[VFX Debug] Slice flash triggered');
          break;

        case 'g': // Test game over
          this.onGameOver({ stackHeight: 5 });
          console.log('[VFX Debug] Game over wash triggered');
          break;

        case 'r': // Test restart
          this.onRestart();
          console.log('[VFX Debug] Restart triggered');
          break;
      }
    });
  }
}

// Singleton instance
let instance: VFXManagerImpl | null = null;

/**
 * Get the VFX Manager singleton instance.
 */
export function getVFXManager(): IVFXManager {
  if (!instance) {
    instance = new VFXManagerImpl();
  }
  return instance;
}

/**
 * Reset the VFX Manager (for testing or hot reload).
 */
export function resetVFXManager(): void {
  if (instance) {
    instance.dispose();
    instance = null;
  }
}

// Re-export types for convenience
export type { PerfectPayload, SlicePayload, GameOverPayload } from './types';
