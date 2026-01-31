/**
 * Fixed timestep game loop hook.
 * Ensures deterministic behavior regardless of frame rate.
 */

import { useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@/state/gameStore';

const FIXED_TIMESTEP_MS = 16; // ~60 updates per second
const MAX_DELTA_MS = 100; // Cap to prevent spiral of death

export function useGameLoop() {
  const accumulatorRef = useRef(0);
  const tick = useGameStore((state) => state.tick);
  const cleanupFallingPieces = useGameStore((state) => state.cleanupFallingPieces);
  const phase = useGameStore((state) => state.phase);

  useFrame((_state, delta) => {
    if (phase !== 'playing') return;

    // Convert to milliseconds and cap
    const deltaMs = Math.min(delta * 1000, MAX_DELTA_MS);
    accumulatorRef.current += deltaMs;

    // Process fixed timesteps
    while (accumulatorRef.current >= FIXED_TIMESTEP_MS) {
      tick(FIXED_TIMESTEP_MS);
      accumulatorRef.current -= FIXED_TIMESTEP_MS;
    }

    // Cleanup old falling pieces periodically
    cleanupFallingPieces();
  });

  const resetAccumulator = useCallback(() => {
    accumulatorRef.current = 0;
  }, []);

  return { resetAccumulator };
}
