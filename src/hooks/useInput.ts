/**
 * Input handling hook using the centralized InputManager.
 * Ensures exactly one drop per user intent across all platforms.
 */

import { useEffect, useCallback } from 'react';
import { useGameStore } from '@/state/gameStore';
import { useVisualStore } from '@/state/visualStore';
import { inputManager } from '@/game/Input';

export function useInput() {
  const phase = useGameStore((state) => state.phase);
  const startGame = useGameStore((state) => state.startGame);
  const dropBlock = useGameStore((state) => state.dropBlock);
  const setVariant = useVisualStore((state) => state.setVariant);

  const handleAction = useCallback(() => {
    if (phase === 'idle' || phase === 'gameover') {
      startGame();
    } else if (phase === 'playing') {
      dropBlock();
    }
  }, [phase, startGame, dropBlock]);

  useEffect(() => {
    // Initialize the input manager
    inputManager.init();

    // Register game action callback
    inputManager.onDropRequested(handleAction);

    // Register variant switch callback
    inputManager.onVariantSwitch(setVariant);

    return () => {
      // Don't destroy on unmount - just update callbacks
      // The manager persists across re-renders
    };
  }, [handleAction, setVariant]);

  // Also expose for programmatic use if needed
  return { handleAction };
}
