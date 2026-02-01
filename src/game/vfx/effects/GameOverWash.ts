/**
 * Game Over Wash Effect
 * Subtle dim/fog ramp when the game ends.
 * Manipulates scene fog density and can optionally dim lights.
 */

import * as THREE from 'three';
import type { IEffect, GameOverPayload } from '../types';
import { VFX_CONFIG } from '../types';

export class GameOverWash implements IEffect {
  private scene: THREE.Scene | null = null;
  private fog: THREE.FogExp2 | null = null;
  private ambientLight: THREE.AmbientLight | null = null;
  private originalAmbientIntensity: number = 0.3;

  private active: boolean = false;
  private startTime: number = 0;
  private currentTime: number = 0;
  private reversed: boolean = false;

  // Store original values for restoration
  private targetFogDensity: number = VFX_CONFIG.GAME_OVER_FOG_DENSITY;
  private targetAmbientDim: number = VFX_CONFIG.GAME_OVER_AMBIENT_DIM;

  init(scene: THREE.Scene): void {
    this.scene = scene;

    // Create exponential fog for depth fade effect
    // Start with zero density (invisible)
    this.fog = new THREE.FogExp2('#0a0a0f', 0);
    scene.fog = this.fog;

    // Find ambient light in scene for dimming
    scene.traverse((obj) => {
      if (obj instanceof THREE.AmbientLight && !this.ambientLight) {
        this.ambientLight = obj;
        this.originalAmbientIntensity = obj.intensity;
      }
    });
  }

  /**
   * Trigger game over wash effect.
   */
  trigger(_payload?: GameOverPayload): void {
    if (this.active && !this.reversed) return; // Already running forward

    this.active = true;
    this.reversed = false;
    this.startTime = this.currentTime;
  }

  /**
   * Reverse the wash effect (on restart).
   */
  reverse(): void {
    if (!this.active && !this.fog?.density) return; // Nothing to reverse

    this.active = true;
    this.reversed = true;
    this.startTime = this.currentTime;
  }

  /**
   * Immediately reset to clear state.
   */
  reset(): void {
    this.active = false;
    this.reversed = false;

    if (this.fog) {
      this.fog.density = 0;
    }

    if (this.ambientLight) {
      this.ambientLight.intensity = this.originalAmbientIntensity;
    }
  }

  update(_deltaMs: number, currentTime: number): void {
    this.currentTime = currentTime;

    if (!this.active) return;

    const elapsed = currentTime - this.startTime;
    const duration = VFX_CONFIG.GAME_OVER_WASH_DURATION;
    let progress = Math.min(elapsed / duration, 1);

    // Ease in/out for smooth transition
    progress = this.easeInOutCubic(progress);

    if (this.reversed) {
      // Fading out (restart)
      progress = 1 - progress;
    }

    // Apply fog density
    if (this.fog) {
      this.fog.density = this.targetFogDensity * progress;
    }

    // Dim ambient light
    if (this.ambientLight) {
      const dimRange = this.originalAmbientIntensity - this.targetAmbientDim;
      this.ambientLight.intensity =
        this.originalAmbientIntensity - dimRange * progress;
    }

    // Check completion
    const rawProgress = Math.min(elapsed / duration, 1);
    if (rawProgress >= 1) {
      this.active = false;
      // If reversed, fully reset
      if (this.reversed) {
        this.reset();
      }
    }
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  setColor(_color: THREE.Color): void {
    // Fog color stays dark, doesn't change with theme
    // Could optionally tint slightly towards theme
  }

  dispose(): void {
    this.reset();
    if (this.scene) {
      this.scene.fog = null;
    }
    this.fog = null;
    this.ambientLight = null;
    this.scene = null;
  }
}
