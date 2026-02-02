import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { KeepAwake } from '@capacitor-community/keep-awake';
import { useGameStore } from '@/state/gameStore';

/**
 * Initializes native platform features:
 * - Hides status bar for immersive experience
 * - Hides splash screen after app loads
 * - Keeps screen awake during gameplay
 */
export function useNativeFeatures() {
  const phase = useGameStore((state) => state.phase);

  // Initialize native features on mount
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const initNative = async () => {
      try {
        // Hide status bar for fullscreen
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#0a0a0f' });
        await StatusBar.hide();
      } catch {
        // StatusBar may not be available
      }

      try {
        // Hide splash screen
        await SplashScreen.hide();
      } catch {
        // SplashScreen may not be available
      }
    };

    initNative();
  }, []);

  // Control keep awake based on game phase
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const controlKeepAwake = async () => {
      try {
        if (phase === 'playing') {
          await KeepAwake.keepAwake();
        } else {
          await KeepAwake.allowSleep();
        }
      } catch {
        // KeepAwake may not be available
      }
    };

    controlKeepAwake();
  }, [phase]);
}
