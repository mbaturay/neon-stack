import { useEffect, useCallback } from 'react';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { useGameStore } from '@/state/gameStore';

/**
 * Handles Android back button behavior:
 * - During gameplay: resets to idle state (returns to title screen)
 * - On idle/gameover: exits the app
 */
export function useAndroidBackButton() {
  const phase = useGameStore((state) => state.phase);
  const reset = useGameStore((state) => state.reset);

  const handleBackButton = useCallback(() => {
    if (phase === 'playing') {
      // During gameplay, reset to idle (title screen)
      reset();
      return true; // Prevent default back behavior
    }
    // On idle or gameover, let the default behavior (exit app) happen
    return false;
  }, [phase, reset]);

  useEffect(() => {
    // Only set up listener on native platforms
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const listener = App.addListener('backButton', ({ canGoBack }) => {
      const handled = handleBackButton();
      if (!handled && !canGoBack) {
        // Exit the app when on main screen
        App.exitApp();
      }
    });

    return () => {
      listener.then((l) => l.remove());
    };
  }, [handleBackButton]);
}
