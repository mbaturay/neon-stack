import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateAxisOverlap,
  isPerfectHit,
  sliceBlock,
  createBlock,
  createBaseBlock,
  createMovingBlock,
  vec3,
  resetIdCounter,
} from '../geometry';
import { GAME_CONSTANTS } from '../types';

describe('geometry', () => {
  beforeEach(() => {
    resetIdCounter();
  });

  describe('vec3', () => {
    it('creates a vector with correct components', () => {
      const v = vec3(1, 2, 3);
      expect(v).toEqual({ x: 1, y: 2, z: 3 });
    });
  });

  describe('createBlock', () => {
    it('creates a block with position and dimensions', () => {
      const block = createBlock(vec3(1, 2, 3), vec3(4, 5, 6));
      expect(block.position).toEqual({ x: 1, y: 2, z: 3 });
      expect(block.dimensions).toEqual({ x: 4, y: 5, z: 6 });
      expect(block.id).toBe('block-1');
    });

    it('uses provided id when given', () => {
      const block = createBlock(vec3(0, 0, 0), vec3(1, 1, 1), 'custom-id');
      expect(block.id).toBe('custom-id');
    });

    it('generates unique ids', () => {
      const block1 = createBlock(vec3(0, 0, 0), vec3(1, 1, 1));
      const block2 = createBlock(vec3(0, 0, 0), vec3(1, 1, 1));
      expect(block1.id).not.toBe(block2.id);
    });
  });

  describe('calculateAxisOverlap', () => {
    it('returns correct overlap for centered blocks', () => {
      // Two 3-unit blocks centered at origin
      const overlap = calculateAxisOverlap(0, 3, 0, 3);
      expect(overlap).toEqual({ min: -1.5, max: 1.5, size: 3 });
    });

    it('returns correct overlap for offset blocks', () => {
      // Block centered at 0 (range -1.5 to 1.5)
      // Block centered at 1 (range -0.5 to 2.5)
      // Overlap: -0.5 to 1.5 = 2 units
      const overlap = calculateAxisOverlap(0, 3, 1, 3);
      expect(overlap).toEqual({ min: -0.5, max: 1.5, size: 2 });
    });

    it('returns null when blocks do not overlap', () => {
      // Block at 0 (range -1.5 to 1.5)
      // Block at 5 (range 3.5 to 6.5)
      const overlap = calculateAxisOverlap(0, 3, 5, 3);
      expect(overlap).toBeNull();
    });

    it('returns null when blocks just touch (no overlap)', () => {
      // Block at 0 (range -1.5 to 1.5)
      // Block at 3 (range 1.5 to 4.5)
      const overlap = calculateAxisOverlap(0, 3, 3, 3);
      expect(overlap).toBeNull();
    });

    it('handles different sized blocks', () => {
      // Block at 0, size 4 (range -2 to 2)
      // Block at 0, size 2 (range -1 to 1)
      const overlap = calculateAxisOverlap(0, 4, 0, 2);
      expect(overlap).toEqual({ min: -1, max: 1, size: 2 });
    });
  });

  describe('isPerfectHit', () => {
    const tolerance = GAME_CONSTANTS.PERFECT_TOLERANCE;

    it('returns true for exactly aligned blocks', () => {
      expect(isPerfectHit(0, 3, 0, 3)).toBe(true);
    });

    it('returns true when offset is within tolerance', () => {
      expect(isPerfectHit(tolerance / 2, 3, 0, 3)).toBe(true);
    });

    it('returns false when offset exceeds tolerance', () => {
      expect(isPerfectHit(tolerance * 2, 3, 0, 3)).toBe(false);
    });

    it('returns false when there is no overlap', () => {
      expect(isPerfectHit(10, 3, 0, 3)).toBe(false);
    });
  });

  describe('sliceBlock', () => {
    const baseBlock = createBlock(vec3(0, 0, 0), vec3(3, 0.5, 3), 'base');

    describe('perfect hit', () => {
      it('returns full block on perfect alignment', () => {
        resetIdCounter();
        const movingBlock = createBlock(vec3(0, 0.5, 0), vec3(3, 0.5, 3));

        const result = sliceBlock(movingBlock, baseBlock, 'x');

        expect(result.isPerfect).toBe(true);
        expect(result.fallen).toBeNull();
        expect(result.kept).not.toBeNull();
        expect(result.kept?.dimensions).toEqual({ x: 3, y: 0.5, z: 3 });
      });

      it('snaps block to base position on perfect hit', () => {
        resetIdCounter();
        const movingBlock = createBlock(vec3(0.05, 0.5, 0), vec3(3, 0.5, 3));

        const result = sliceBlock(movingBlock, baseBlock, 'x');

        expect(result.isPerfect).toBe(true);
        expect(result.kept?.position.x).toBe(0); // Snapped to base
      });
    });

    describe('partial overlap - x axis', () => {
      it('correctly slices when block is offset to the right', () => {
        resetIdCounter();
        // Base at 0, size 3 (range -1.5 to 1.5)
        // Moving at 1, size 3 (range -0.5 to 2.5)
        // Overlap: -0.5 to 1.5 = 2 units
        // Fallen: 1.5 to 2.5 = 1 unit
        const movingBlock = createBlock(vec3(1, 0.5, 0), vec3(3, 0.5, 3));

        const result = sliceBlock(movingBlock, baseBlock, 'x');

        expect(result.isPerfect).toBe(false);
        expect(result.kept).not.toBeNull();
        expect(result.fallen).not.toBeNull();

        // Kept portion
        expect(result.kept?.dimensions.x).toBeCloseTo(2); // Overlap size
        expect(result.kept?.position.x).toBeCloseTo(0.5); // Center of overlap

        // Fallen portion
        expect(result.fallen?.dimensions.x).toBeCloseTo(1); // Overhang size
        expect(result.fallen?.position.x).toBeCloseTo(2); // Center of overhang
      });

      it('correctly slices when block is offset to the left', () => {
        resetIdCounter();
        const movingBlock = createBlock(vec3(-1, 0.5, 0), vec3(3, 0.5, 3));

        const result = sliceBlock(movingBlock, baseBlock, 'x');

        expect(result.kept?.dimensions.x).toBeCloseTo(2);
        expect(result.kept?.position.x).toBeCloseTo(-0.5);

        expect(result.fallen?.dimensions.x).toBeCloseTo(1);
        expect(result.fallen?.position.x).toBeCloseTo(-2);
      });
    });

    describe('partial overlap - z axis', () => {
      it('correctly slices along z axis', () => {
        resetIdCounter();
        const movingBlock = createBlock(vec3(0, 0.5, 1), vec3(3, 0.5, 3));

        const result = sliceBlock(movingBlock, baseBlock, 'z');

        expect(result.kept?.dimensions.z).toBeCloseTo(2);
        expect(result.kept?.dimensions.x).toBe(3); // X dimension unchanged
        expect(result.fallen?.dimensions.z).toBeCloseTo(1);
      });
    });

    describe('complete miss', () => {
      it('returns null kept and full fallen when block completely misses', () => {
        resetIdCounter();
        const movingBlock = createBlock(vec3(10, 0.5, 0), vec3(3, 0.5, 3));

        const result = sliceBlock(movingBlock, baseBlock, 'x');

        expect(result.isPerfect).toBe(false);
        expect(result.kept).toBeNull();
        expect(result.fallen).not.toBeNull();
        expect(result.fallen?.dimensions.x).toBe(3);
      });
    });
  });

  describe('createBaseBlock', () => {
    it('creates a base block at origin with correct dimensions', () => {
      const base = createBaseBlock();
      expect(base.position).toEqual({ x: 0, y: 0, z: 0 });
      expect(base.dimensions.x).toBe(GAME_CONSTANTS.INITIAL_BLOCK_SIZE);
      expect(base.dimensions.z).toBe(GAME_CONSTANTS.INITIAL_BLOCK_SIZE);
      expect(base.dimensions.y).toBe(GAME_CONSTANTS.BLOCK_HEIGHT);
      expect(base.id).toBe('base');
    });
  });

  describe('createMovingBlock', () => {
    it('creates a block above the last block for x-axis movement', () => {
      const lastBlock = createBlock(vec3(0, 1, 0), vec3(3, 0.5, 3), 'last');

      const moving = createMovingBlock(lastBlock, 'x');

      expect(moving.position.y).toBe(1.5); // One block height above
      expect(moving.position.x).toBe(-GAME_CONSTANTS.OSCILLATION_AMPLITUDE); // Starts at negative amplitude
      expect(moving.position.z).toBe(0); // Same z as last block
      expect(moving.dimensions).toEqual(lastBlock.dimensions);
    });

    it('creates a block above the last block for z-axis movement', () => {
      const lastBlock = createBlock(vec3(1, 2, 0.5), vec3(2.5, 0.5, 2.5), 'last');

      const moving = createMovingBlock(lastBlock, 'z');

      expect(moving.position.y).toBe(2.5);
      expect(moving.position.x).toBe(1); // Same x as last block
      expect(moving.position.z).toBe(-GAME_CONSTANTS.OSCILLATION_AMPLITUDE);
    });
  });
});
