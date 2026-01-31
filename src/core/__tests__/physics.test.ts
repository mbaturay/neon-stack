import { describe, it, expect } from 'vitest';
import {
  oscillatePosition,
  updateBlockOscillation,
  updateFallingPiece,
  createFallingPiece,
  shouldRemoveFallingPiece,
} from '../physics';
import { createBlock, vec3 } from '../geometry';
import { GAME_CONSTANTS } from '../types';
import type { FallingPiece } from '../types';

describe('physics', () => {
  describe('oscillatePosition', () => {
    it('returns center offset at time 0', () => {
      const pos = oscillatePosition(0, 4, 2, 0);
      expect(pos).toBe(0); // sin(0) = 0
    });

    it('returns maximum amplitude at quarter period', () => {
      // sin(π/2) = 1, so at t = π/(2*speed) we should be at max
      const speed = 2;
      const amplitude = 4;
      const quarterPeriod = Math.PI / (2 * speed);

      const pos = oscillatePosition(quarterPeriod, amplitude, speed, 0);
      expect(pos).toBeCloseTo(amplitude);
    });

    it('returns negative amplitude at three-quarter period', () => {
      const speed = 2;
      const amplitude = 4;
      const threeQuarterPeriod = (3 * Math.PI) / (2 * speed);

      const pos = oscillatePosition(threeQuarterPeriod, amplitude, speed, 0);
      expect(pos).toBeCloseTo(-amplitude);
    });

    it('applies center offset correctly', () => {
      const pos = oscillatePosition(0, 4, 2, 5);
      expect(pos).toBe(5); // sin(0) = 0, so just the offset
    });

    it('uses default values from GAME_CONSTANTS', () => {
      const pos = oscillatePosition(0);
      expect(pos).toBe(0);
    });
  });

  describe('updateBlockOscillation', () => {
    it('updates x position when axis is x', () => {
      const block = createBlock(vec3(0, 1, 2), vec3(3, 0.5, 3), 'test');
      const quarterPeriod = Math.PI / (2 * GAME_CONSTANTS.OSCILLATION_SPEED);

      const updated = updateBlockOscillation(block, 'x', quarterPeriod);

      expect(updated.position.x).toBeCloseTo(GAME_CONSTANTS.OSCILLATION_AMPLITUDE);
      expect(updated.position.y).toBe(1); // Unchanged
      expect(updated.position.z).toBe(2); // Unchanged
    });

    it('updates z position when axis is z', () => {
      const block = createBlock(vec3(1, 2, 0), vec3(3, 0.5, 3), 'test');
      const quarterPeriod = Math.PI / (2 * GAME_CONSTANTS.OSCILLATION_SPEED);

      const updated = updateBlockOscillation(block, 'z', quarterPeriod);

      expect(updated.position.z).toBeCloseTo(GAME_CONSTANTS.OSCILLATION_AMPLITUDE);
      expect(updated.position.x).toBe(1); // Unchanged
      expect(updated.position.y).toBe(2); // Unchanged
    });

    it('returns a new block object (immutable)', () => {
      const block = createBlock(vec3(0, 0, 0), vec3(3, 0.5, 3), 'test');
      const updated = updateBlockOscillation(block, 'x', 1);

      expect(updated).not.toBe(block);
      expect(updated.position).not.toBe(block.position);
    });
  });

  describe('updateFallingPiece', () => {
    it('applies gravity to velocity', () => {
      const piece: FallingPiece = {
        id: 'test',
        block: createBlock(vec3(0, 5, 0), vec3(1, 0.5, 1), 'fallen'),
        velocity: vec3(2, 0, 0),
        angularVelocity: vec3(0, 0, 0),
        createdAt: 0,
      };

      const deltaTime = 0.1;
      const updated = updateFallingPiece(piece, deltaTime);

      expect(updated.velocity.y).toBeCloseTo(GAME_CONSTANTS.GRAVITY * deltaTime);
      expect(updated.velocity.x).toBe(2); // Unchanged
    });

    it('updates position based on velocity', () => {
      const piece: FallingPiece = {
        id: 'test',
        block: createBlock(vec3(0, 10, 0), vec3(1, 0.5, 1), 'fallen'),
        velocity: vec3(5, -10, 3),
        angularVelocity: vec3(0, 0, 0),
        createdAt: 0,
      };

      const deltaTime = 0.1;
      const updated = updateFallingPiece(piece, deltaTime);

      // Position after applying velocity (which includes new gravity)
      expect(updated.block.position.x).toBeCloseTo(0.5);
      expect(updated.block.position.z).toBeCloseTo(0.3);
    });

    it('returns a new piece object (immutable)', () => {
      const piece: FallingPiece = {
        id: 'test',
        block: createBlock(vec3(0, 0, 0), vec3(1, 0.5, 1), 'fallen'),
        velocity: vec3(0, 0, 0),
        angularVelocity: vec3(0, 0, 0),
        createdAt: 0,
      };

      const updated = updateFallingPiece(piece, 0.1);

      expect(updated).not.toBe(piece);
      expect(updated.block).not.toBe(piece.block);
    });
  });

  describe('createFallingPiece', () => {
    it('creates a falling piece with correct properties', () => {
      const fallenBlock = createBlock(vec3(2, 1, 0), vec3(1, 0.5, 3), 'fallen');
      const baseBlock = createBlock(vec3(0, 0, 0), vec3(3, 0.5, 3), 'base');

      const piece = createFallingPiece(fallenBlock, baseBlock, 'x', 1000);

      expect(piece.id).toBe('falling-fallen');
      expect(piece.block).toBe(fallenBlock);
      expect(piece.createdAt).toBe(1000);
      expect(piece.velocity.x).toBeGreaterThan(0); // Falls away from stack
    });

    it('velocity direction depends on overhang side', () => {
      const baseBlock = createBlock(vec3(0, 0, 0), vec3(3, 0.5, 3), 'base');

      // Overhang on positive side
      const fallenRight = createBlock(vec3(2, 1, 0), vec3(1, 0.5, 3), 'fallen-right');
      const pieceRight = createFallingPiece(fallenRight, baseBlock, 'x', 0);
      expect(pieceRight.velocity.x).toBeGreaterThan(0);

      // Overhang on negative side
      const fallenLeft = createBlock(vec3(-2, 1, 0), vec3(1, 0.5, 3), 'fallen-left');
      const pieceLeft = createFallingPiece(fallenLeft, baseBlock, 'x', 0);
      expect(pieceLeft.velocity.x).toBeLessThan(0);
    });
  });

  describe('shouldRemoveFallingPiece', () => {
    it('returns true when piece is too old', () => {
      const piece: FallingPiece = {
        id: 'test',
        block: createBlock(vec3(0, 0, 0), vec3(1, 0.5, 1), 'fallen'),
        velocity: vec3(0, 0, 0),
        angularVelocity: vec3(0, 0, 0),
        createdAt: 0,
      };

      const currentTime = GAME_CONSTANTS.FALLING_PIECE_LIFETIME + 1;
      expect(shouldRemoveFallingPiece(piece, currentTime)).toBe(true);
    });

    it('returns true when piece is too far below', () => {
      const piece: FallingPiece = {
        id: 'test',
        block: createBlock(vec3(0, -25, 0), vec3(1, 0.5, 1), 'fallen'),
        velocity: vec3(0, 0, 0),
        angularVelocity: vec3(0, 0, 0),
        createdAt: 0,
      };

      expect(shouldRemoveFallingPiece(piece, 100)).toBe(true);
    });

    it('returns false for fresh piece at normal height', () => {
      const piece: FallingPiece = {
        id: 'test',
        block: createBlock(vec3(0, 5, 0), vec3(1, 0.5, 1), 'fallen'),
        velocity: vec3(0, 0, 0),
        angularVelocity: vec3(0, 0, 0),
        createdAt: 1000,
      };

      expect(shouldRemoveFallingPiece(piece, 1500)).toBe(false);
    });
  });
});
