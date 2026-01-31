/**
 * Main game state store using Zustand.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameState } from './types';
import type { Axis, Block } from '@/core/types';
import {
  createBaseBlock,
  createMovingBlock,
  sliceBlock,
  resetIdCounter,
} from '@/core/geometry';
import { updateBlockOscillation, createFallingPiece, shouldRemoveFallingPiece } from '@/core/physics';
import { calculateHitScore, updatePerfectStreak } from '@/core/scoring';

function getNextAxis(current: Axis): Axis {
  return current === 'x' ? 'z' : 'x';
}

function getTopBlock(blocks: Block[]): Block {
  const top = blocks[blocks.length - 1];
  if (!top) {
    throw new Error('No blocks in stack');
  }
  return top;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Initial state
      phase: 'idle',
      blocks: [],
      currentBlock: null,
      movingAxis: 'x',
      gameTime: 0,
      score: 0,
      perfectStreak: 0,
      highScore: 0,
      fallingPieces: [],
      lastPerfectHit: false,

      startGame: () => {
        resetIdCounter();
        const baseBlock = createBaseBlock();
        const firstMovingBlock = createMovingBlock(baseBlock, 'x');

        set({
          phase: 'playing',
          blocks: [baseBlock],
          currentBlock: firstMovingBlock,
          movingAxis: 'x',
          gameTime: 0,
          score: 0,
          perfectStreak: 0,
          fallingPieces: [],
          lastPerfectHit: false,
        });
      },

      dropBlock: () => {
        const state = get();
        if (state.phase !== 'playing' || !state.currentBlock) return;

        const topBlock = getTopBlock(state.blocks);
        const result = sliceBlock(state.currentBlock, topBlock, state.movingAxis);

        if (!result.kept) {
          // Complete miss - game over
          const fallingPiece = result.fallen
            ? createFallingPiece(result.fallen, topBlock, state.movingAxis, state.gameTime)
            : null;

          set({
            phase: 'gameover',
            currentBlock: null,
            fallingPieces: fallingPiece
              ? [...state.fallingPieces, fallingPiece]
              : state.fallingPieces,
            highScore: Math.max(state.score, state.highScore),
          });
          return;
        }

        // Successful placement
        const newStreak = updatePerfectStreak(state.perfectStreak, result.isPerfect);
        const points = calculateHitScore(state.perfectStreak, result.isPerfect);
        const newScore = state.score + points;
        const newBlocks = [...state.blocks, result.kept];
        const nextAxis = getNextAxis(state.movingAxis);
        const nextBlock = createMovingBlock(result.kept, nextAxis);

        // Add falling piece if there was an overhang
        const newFallingPieces = result.fallen
          ? [
              ...state.fallingPieces,
              createFallingPiece(result.fallen, topBlock, state.movingAxis, state.gameTime),
            ]
          : state.fallingPieces;

        set({
          blocks: newBlocks,
          currentBlock: nextBlock,
          movingAxis: nextAxis,
          score: newScore,
          perfectStreak: newStreak,
          fallingPieces: newFallingPieces,
          lastPerfectHit: result.isPerfect,
          highScore: Math.max(newScore, state.highScore),
        });
      },

      tick: (deltaMs: number) => {
        const state = get();
        if (state.phase !== 'playing' || !state.currentBlock) return;

        const newGameTime = state.gameTime + deltaMs;
        const elapsedSeconds = newGameTime / 1000;

        // Get center offset from top block
        const topBlock = getTopBlock(state.blocks);
        const centerOffset = topBlock.position[state.movingAxis];

        // Update moving block position
        const updatedBlock = updateBlockOscillation(
          state.currentBlock,
          state.movingAxis,
          elapsedSeconds,
          centerOffset
        );

        set({
          gameTime: newGameTime,
          currentBlock: updatedBlock,
        });
      },

      cleanupFallingPieces: () => {
        const state = get();
        const remaining = state.fallingPieces.filter(
          (piece) => !shouldRemoveFallingPiece(piece, state.gameTime)
        );

        if (remaining.length !== state.fallingPieces.length) {
          set({ fallingPieces: remaining });
        }
      },

      reset: () => {
        set({
          phase: 'idle',
          blocks: [],
          currentBlock: null,
          movingAxis: 'x',
          gameTime: 0,
          score: 0,
          perfectStreak: 0,
          fallingPieces: [],
          lastPerfectHit: false,
        });
      },
    }),
    {
      name: 'neon-stack-storage',
      partialize: (state) => ({ highScore: state.highScore }),
    }
  )
);
