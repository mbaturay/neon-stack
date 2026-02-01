/**
 * Slice Flash Effect
 * Quick bright line flash at the cut edge when a block is sliced.
 * Uses object pooling to avoid runtime allocations.
 */

import * as THREE from 'three';
import type { IEffect, PooledEffect, SlicePayload } from '../types';
import { VFX_CONFIG } from '../types';

interface FlashInstance extends PooledEffect<THREE.Mesh> {
  /** Direction of the cut for orientation */
  cutAxis: 'x' | 'z';
}

export class SliceFlash implements IEffect {
  private scene: THREE.Scene | null = null;
  private pool: FlashInstance[] = [];
  private geometry: THREE.PlaneGeometry;
  private material: THREE.MeshBasicMaterial;
  private currentTime: number = 0;

  constructor() {
    // Create thin plane geometry (will be scaled per-instance)
    // Default 1x1, we'll scale X to cut length and Y to flash width
    this.geometry = new THREE.PlaneGeometry(1, 1);

    // Create material with additive blending for bright flash
    this.material = new THREE.MeshBasicMaterial({
      color: 0x00f6ff,
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }

  init(scene: THREE.Scene): void {
    this.scene = scene;

    // Pre-allocate pool
    for (let i = 0; i < VFX_CONFIG.SLICE_FLASH_POOL_SIZE; i++) {
      const mesh = new THREE.Mesh(this.geometry, this.material.clone());
      mesh.visible = false;
      mesh.renderOrder = 99;
      scene.add(mesh);

      this.pool.push({
        object: mesh,
        active: false,
        startTime: 0,
        duration: VFX_CONFIG.SLICE_FLASH_DURATION,
        cutAxis: 'x',
      });
    }
  }

  /**
   * Trigger a new slice flash effect.
   */
  trigger(payload: SlicePayload): void {
    const instance = this.pool.find((f) => !f.active);
    if (!instance) return;

    const { cutPosition, cutLength, axis, cutY } = payload;

    // Position at cut location, slightly above to avoid z-fighting
    instance.object.position.set(cutPosition.x, cutY + 0.01, cutPosition.z);

    // Scale: length along cut, thin width
    instance.object.scale.set(
      axis === 'x' ? VFX_CONFIG.SLICE_FLASH_WIDTH : cutLength,
      1, // Will be rotated
      axis === 'z' ? VFX_CONFIG.SLICE_FLASH_WIDTH : cutLength
    );

    // Rotate to lie flat on the block top face
    // Then orient along the cut axis
    instance.object.rotation.set(-Math.PI / 2, 0, 0);
    if (axis === 'x') {
      // Cut is perpendicular to X, so line runs along Z
      instance.object.scale.set(cutLength, VFX_CONFIG.SLICE_FLASH_WIDTH, 1);
    } else {
      // Cut is perpendicular to Z, so line runs along X
      instance.object.scale.set(cutLength, VFX_CONFIG.SLICE_FLASH_WIDTH, 1);
      instance.object.rotation.z = Math.PI / 2;
    }

    // Reset opacity
    const mat = instance.object.material as THREE.MeshBasicMaterial;
    mat.opacity = VFX_CONFIG.SLICE_FLASH_OPACITY_START;

    // Activate
    instance.cutAxis = axis;
    instance.active = true;
    instance.startTime = this.currentTime;
    instance.object.visible = true;
  }

  update(_deltaMs: number, currentTime: number): void {
    this.currentTime = currentTime;

    for (const instance of this.pool) {
      if (!instance.active) continue;

      const elapsed = currentTime - instance.startTime;
      const progress = Math.min(elapsed / instance.duration, 1);

      if (progress >= 1) {
        instance.active = false;
        instance.object.visible = false;
        continue;
      }

      // Fast ease out for snappy flash
      // Use exponential decay for quick fade
      const opacity = VFX_CONFIG.SLICE_FLASH_OPACITY_START * Math.pow(1 - progress, 2);

      const mat = instance.object.material as THREE.MeshBasicMaterial;
      mat.opacity = opacity;

      // Optional: slight scale pulse at start
      if (progress < 0.2) {
        const pulse = 1 + 0.3 * (1 - progress / 0.2);
        const baseScaleY = VFX_CONFIG.SLICE_FLASH_WIDTH;
        instance.object.scale.y = baseScaleY * pulse;
      }
    }
  }

  setColor(color: THREE.Color): void {
    this.material.color.copy(color);
    for (const instance of this.pool) {
      const mat = instance.object.material as THREE.MeshBasicMaterial;
      mat.color.copy(color);
    }
  }

  dispose(): void {
    for (const instance of this.pool) {
      if (this.scene) {
        this.scene.remove(instance.object);
      }
      (instance.object.material as THREE.Material).dispose();
    }
    this.pool = [];
    this.geometry.dispose();
    this.material.dispose();
    this.scene = null;
  }
}
