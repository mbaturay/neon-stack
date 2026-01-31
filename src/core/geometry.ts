/**
 * Pure geometry functions for block overlap and slicing calculations.
 * No side effects, fully deterministic.
 */

import type { Block, SliceResult, Axis, Vector3 } from './types';
import { GAME_CONSTANTS } from './types';

/** Generate a unique ID */
let idCounter = 0;
export function generateId(): string {
  return `block-${++idCounter}`;
}

/** Reset ID counter (useful for tests) */
export function resetIdCounter(): void {
  idCounter = 0;
}

/** Create a new Vector3 */
export function vec3(x: number, y: number, z: number): Vector3 {
  return { x, y, z };
}

/** Create a new block */
export function createBlock(
  position: Vector3,
  dimensions: Vector3,
  id?: string
): Block {
  return {
    id: id ?? generateId(),
    position: { ...position },
    dimensions: { ...dimensions },
  };
}

/**
 * Calculate the overlap between two blocks along a single axis.
 * Returns the overlap range [min, max] or null if no overlap.
 */
export function calculateAxisOverlap(
  movingPos: number,
  movingSize: number,
  basePos: number,
  baseSize: number
): { min: number; max: number; size: number } | null {
  const movingMin = movingPos - movingSize / 2;
  const movingMax = movingPos + movingSize / 2;
  const baseMin = basePos - baseSize / 2;
  const baseMax = basePos + baseSize / 2;

  const overlapMin = Math.max(movingMin, baseMin);
  const overlapMax = Math.min(movingMax, baseMax);

  if (overlapMin >= overlapMax) {
    return null; // No overlap
  }

  return {
    min: overlapMin,
    max: overlapMax,
    size: overlapMax - overlapMin,
  };
}

/**
 * Determine if a hit is "perfect" (within tolerance).
 * A perfect hit means the moving block is almost perfectly aligned with the base.
 */
export function isPerfectHit(
  movingPos: number,
  movingSize: number,
  basePos: number,
  baseSize: number,
  tolerance: number = GAME_CONSTANTS.PERFECT_TOLERANCE
): boolean {
  const overlap = calculateAxisOverlap(movingPos, movingSize, basePos, baseSize);

  if (!overlap) return false;

  // Perfect if we keep almost all of the moving block
  return movingSize - overlap.size <= tolerance;
}

/**
 * Slice a block against a base block.
 * Returns the kept portion (on top of base) and the fallen portion (overhang).
 */
export function sliceBlock(
  moving: Block,
  base: Block,
  axis: Axis
): SliceResult {
  const movingPos = moving.position[axis];
  const movingSize = moving.dimensions[axis === 'x' ? 'x' : 'z'];
  const basePos = base.position[axis];
  const baseSize = base.dimensions[axis === 'x' ? 'x' : 'z'];

  // Check for perfect hit first
  if (isPerfectHit(movingPos, movingSize, basePos, baseSize)) {
    // Perfect hit - keep the full block, centered on base
    const keptBlock = createBlock(
      {
        x: axis === 'x' ? basePos : moving.position.x,
        y: moving.position.y,
        z: axis === 'z' ? basePos : moving.position.z,
      },
      { ...moving.dimensions }
    );
    return {
      kept: keptBlock,
      fallen: null,
      isPerfect: true,
    };
  }

  // Calculate overlap
  const overlap = calculateAxisOverlap(movingPos, movingSize, basePos, baseSize);

  if (!overlap) {
    // Complete miss - nothing kept
    return {
      kept: null,
      fallen: createBlock(
        { ...moving.position },
        { ...moving.dimensions }
      ),
      isPerfect: false,
    };
  }

  // Calculate kept portion (overlap area)
  const keptCenter = (overlap.min + overlap.max) / 2;
  const keptSize = overlap.size;

  // Calculate fallen portion (overhang)
  const movingMin = movingPos - movingSize / 2;
  const movingMax = movingPos + movingSize / 2;

  let fallenCenter: number;
  let fallenSize: number;

  if (movingMin < overlap.min) {
    // Overhang on the negative side
    fallenSize = overlap.min - movingMin;
    fallenCenter = movingMin + fallenSize / 2;
  } else {
    // Overhang on the positive side
    fallenSize = movingMax - overlap.max;
    fallenCenter = overlap.max + fallenSize / 2;
  }

  const keptBlock = createBlock(
    {
      x: axis === 'x' ? keptCenter : moving.position.x,
      y: moving.position.y,
      z: axis === 'z' ? keptCenter : moving.position.z,
    },
    {
      x: axis === 'x' ? keptSize : moving.dimensions.x,
      y: moving.dimensions.y,
      z: axis === 'z' ? keptSize : moving.dimensions.z,
    }
  );

  const fallenBlock = createBlock(
    {
      x: axis === 'x' ? fallenCenter : moving.position.x,
      y: moving.position.y,
      z: axis === 'z' ? fallenCenter : moving.position.z,
    },
    {
      x: axis === 'x' ? fallenSize : moving.dimensions.x,
      y: moving.dimensions.y,
      z: axis === 'z' ? fallenSize : moving.dimensions.z,
    }
  );

  return {
    kept: keptBlock,
    fallen: fallenBlock,
    isPerfect: false,
  };
}

/**
 * Create the initial base block (platform).
 */
export function createBaseBlock(): Block {
  return createBlock(
    vec3(0, 0, 0),
    vec3(GAME_CONSTANTS.INITIAL_BLOCK_SIZE, GAME_CONSTANTS.BLOCK_HEIGHT, GAME_CONSTANTS.INITIAL_BLOCK_SIZE),
    'base'
  );
}

/**
 * Create a new moving block that spawns above the last placed block.
 */
export function createMovingBlock(lastBlock: Block, axis: Axis): Block {
  const spawnOffset = GAME_CONSTANTS.OSCILLATION_AMPLITUDE;

  return createBlock(
    {
      x: axis === 'x' ? -spawnOffset : lastBlock.position.x,
      y: lastBlock.position.y + GAME_CONSTANTS.BLOCK_HEIGHT,
      z: axis === 'z' ? -spawnOffset : lastBlock.position.z,
    },
    { ...lastBlock.dimensions }
  );
}
