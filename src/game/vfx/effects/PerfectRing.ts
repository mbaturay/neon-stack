/**
 * Perfect Ring Effect
 * Expanding neon ring that appears on perfect block placements.
 * Uses object pooling to avoid runtime allocations.
 */

import * as THREE from 'three';
import type { IEffect, PooledEffect, PerfectPayload } from '../types';
import { VFX_CONFIG } from '../types';

interface RingInstance extends PooledEffect<THREE.Mesh> {
  /** Initial scale for the ring based on block size */
  baseScale: THREE.Vector2;
}

// Shared geometry - thin ring with inner/outer radius ratio
const RING_INNER_RADIUS = 0.45;
const RING_OUTER_RADIUS = 0.5;
const RING_SEGMENTS = 48;

export class PerfectRing implements IEffect {
  private scene: THREE.Scene | null = null;
  private pool: RingInstance[] = [];
  private geometry: THREE.RingGeometry;
  private material: THREE.MeshBasicMaterial;
  private currentTime: number = 0;

  constructor() {
    // Create shared geometry
    this.geometry = new THREE.RingGeometry(
      RING_INNER_RADIUS,
      RING_OUTER_RADIUS,
      RING_SEGMENTS
    );

    // Create shared material with additive blending for glow
    this.material = new THREE.MeshBasicMaterial({
      color: 0x00f6ff, // Default cyan, will be updated
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
    for (let i = 0; i < VFX_CONFIG.PERFECT_RING_POOL_SIZE; i++) {
      const mesh = new THREE.Mesh(this.geometry, this.material.clone());
      mesh.visible = false;
      mesh.rotation.x = -Math.PI / 2; // Face up (horizontal plane)
      mesh.renderOrder = 100; // Render on top
      scene.add(mesh);

      this.pool.push({
        object: mesh,
        active: false,
        startTime: 0,
        duration: VFX_CONFIG.PERFECT_RING_DURATION,
        baseScale: new THREE.Vector2(1, 1),
      });
    }
  }

  /**
   * Trigger a new perfect ring effect.
   */
  trigger(payload: PerfectPayload): void {
    // Find inactive instance from pool
    const instance = this.pool.find((r) => !r.active);
    if (!instance) return; // Pool exhausted, skip effect

    const { position, size, topY } = payload;

    // Position slightly above the block top face
    instance.object.position.set(position.x, topY + 0.02, position.z);

    // Scale ring to match block dimensions (use larger dimension)
    const blockScale = Math.max(size.x, size.z);
    instance.baseScale.set(blockScale, blockScale);
    instance.object.scale.set(
      blockScale * VFX_CONFIG.PERFECT_RING_SCALE_START,
      blockScale * VFX_CONFIG.PERFECT_RING_SCALE_START,
      1
    );

    // Reset opacity
    const mat = instance.object.material as THREE.MeshBasicMaterial;
    mat.opacity = VFX_CONFIG.PERFECT_RING_OPACITY_START;

    // Activate
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
        // Effect complete - deactivate
        instance.active = false;
        instance.object.visible = false;
        continue;
      }

      // Ease out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);

      // Interpolate scale
      const scaleRange =
        VFX_CONFIG.PERFECT_RING_SCALE_END - VFX_CONFIG.PERFECT_RING_SCALE_START;
      const currentScale =
        VFX_CONFIG.PERFECT_RING_SCALE_START + scaleRange * eased;

      instance.object.scale.set(
        instance.baseScale.x * currentScale,
        instance.baseScale.y * currentScale,
        1
      );

      // Fade out opacity
      const mat = instance.object.material as THREE.MeshBasicMaterial;
      mat.opacity = VFX_CONFIG.PERFECT_RING_OPACITY_START * (1 - eased);
    }
  }

  setColor(color: THREE.Color): void {
    // Update base material
    this.material.color.copy(color);

    // Update all pool instances
    for (const instance of this.pool) {
      const mat = instance.object.material as THREE.MeshBasicMaterial;
      mat.color.copy(color);
    }
  }

  dispose(): void {
    // Remove meshes from scene
    for (const instance of this.pool) {
      if (this.scene) {
        this.scene.remove(instance.object);
      }
      (instance.object.material as THREE.Material).dispose();
    }
    this.pool = [];

    // Dispose shared resources
    this.geometry.dispose();
    this.material.dispose();
    this.scene = null;
  }
}
