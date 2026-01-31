/**
 * Pure physics functions for block movement and falling pieces.
 * All functions are deterministic based on elapsed time.
 */

import type { Vector3, FallingPiece, Block, Axis } from './types';
import { GAME_CONSTANTS } from './types';
import { vec3 } from './geometry';

/**
 * Calculate oscillating position along an axis using sine wave.
 * @param elapsedTime - Time in seconds since oscillation started
 * @param amplitude - Maximum displacement from center
 * @param speed - Angular speed in radians per second
 * @param centerOffset - Center position offset
 * @returns Position along the axis
 */
export function oscillatePosition(
  elapsedTime: number,
  amplitude: number = GAME_CONSTANTS.OSCILLATION_AMPLITUDE,
  speed: number = GAME_CONSTANTS.OSCILLATION_SPEED,
  centerOffset: number = 0
): number {
  return centerOffset + Math.sin(elapsedTime * speed) * amplitude;
}

/**
 * Update a block's position based on oscillation.
 * Returns a new block with updated position (immutable).
 */
export function updateBlockOscillation(
  block: Block,
  axis: Axis,
  elapsedTime: number,
  centerOffset: number = 0
): Block {
  const oscillatedPos = oscillatePosition(
    elapsedTime,
    GAME_CONSTANTS.OSCILLATION_AMPLITUDE,
    GAME_CONSTANTS.OSCILLATION_SPEED,
    centerOffset
  );

  return {
    ...block,
    position: {
      ...block.position,
      [axis]: oscillatedPos,
    },
  };
}

/**
 * Calculate the velocity for a falling piece based on its overhang direction.
 * The piece falls away from the stack with some horizontal velocity.
 */
export function calculateFallingVelocity(
  fallenBlock: Block,
  baseBlock: Block,
  axis: Axis
): Vector3 {
  const direction = fallenBlock.position[axis] > baseBlock.position[axis] ? 1 : -1;
  const horizontalSpeed = 2 + Math.random() * 2; // Some randomness for visual variety

  return vec3(
    axis === 'x' ? direction * horizontalSpeed : (Math.random() - 0.5) * 0.5,
    0, // Initial vertical velocity is 0
    axis === 'z' ? direction * horizontalSpeed : (Math.random() - 0.5) * 0.5
  );
}

/**
 * Calculate angular velocity for a falling piece (tumbling effect).
 */
export function calculateAngularVelocity(axis: Axis): Vector3 {
  const rotationSpeed = 2 + Math.random() * 3;
  return vec3(
    axis === 'z' ? rotationSpeed : (Math.random() - 0.5) * 2,
    (Math.random() - 0.5) * 2,
    axis === 'x' ? rotationSpeed : (Math.random() - 0.5) * 2
  );
}

/**
 * Update a falling piece's position based on physics.
 * @param piece - The falling piece to update
 * @param deltaTime - Time step in seconds
 * @returns Updated falling piece with new position and velocity
 */
export function updateFallingPiece(
  piece: FallingPiece,
  deltaTime: number
): FallingPiece {
  // Update velocity with gravity
  const newVelocity: Vector3 = {
    x: piece.velocity.x,
    y: piece.velocity.y + GAME_CONSTANTS.GRAVITY * deltaTime,
    z: piece.velocity.z,
  };

  // Update position
  const newPosition: Vector3 = {
    x: piece.block.position.x + newVelocity.x * deltaTime,
    y: piece.block.position.y + newVelocity.y * deltaTime,
    z: piece.block.position.z + newVelocity.z * deltaTime,
  };

  return {
    ...piece,
    velocity: newVelocity,
    block: {
      ...piece.block,
      position: newPosition,
    },
  };
}

/**
 * Create a falling piece from a sliced block.
 */
export function createFallingPiece(
  fallenBlock: Block,
  baseBlock: Block,
  axis: Axis,
  currentTime: number
): FallingPiece {
  return {
    id: `falling-${fallenBlock.id}`,
    block: fallenBlock,
    velocity: calculateFallingVelocity(fallenBlock, baseBlock, axis),
    angularVelocity: calculateAngularVelocity(axis),
    createdAt: currentTime,
  };
}

/**
 * Check if a falling piece should be removed (too old or too far below).
 */
export function shouldRemoveFallingPiece(
  piece: FallingPiece,
  currentTime: number
): boolean {
  const age = currentTime - piece.createdAt;
  const isTooOld = age > GAME_CONSTANTS.FALLING_PIECE_LIFETIME;
  const isTooFarBelow = piece.block.position.y < -20;

  return isTooOld || isTooFarBelow;
}
