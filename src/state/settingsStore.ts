/**
 * Settings store with persistence.
 * Manages visual style, theme color, audio levels, and accessibility options.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { VisualVariant } from '@/rendering/VisualStyle';
import type { ThemeColor, ThemeColors } from '@/game/Theme';
import { getTheme, applyThemeToCss } from '@/game/Theme';
import { useVisualStore } from './visualStore';

export interface SettingsState {
  // Visual
  visualVariant: VisualVariant;
  themeColor: ThemeColor;

  // Audio (placeholders for future audio engine)
  musicVolume: number;  // 0-100
  sfxVolume: number;    // 0-100

  // Accessibility
  reducedMotion: boolean;

  // UI state
  isSettingsOpen: boolean;

  // Computed
  theme: ThemeColors;

  // Actions
  setVisualVariant: (variant: VisualVariant) => void;
  setThemeColor: (color: ThemeColor) => void;
  setMusicVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
  setReducedMotion: (enabled: boolean) => void;
  openSettings: () => void;
  closeSettings: () => void;
  resetToDefaults: () => void;
}

const DEFAULT_SETTINGS = {
  visualVariant: 'A' as VisualVariant,
  themeColor: 'cyan' as ThemeColor,
  musicVolume: 80,
  sfxVolume: 80,
  reducedMotion: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Initial state
      ...DEFAULT_SETTINGS,
      isSettingsOpen: false,
      theme: getTheme(DEFAULT_SETTINGS.themeColor),

      setVisualVariant: (variant: VisualVariant) => {
        set({ visualVariant: variant });
      },

      setThemeColor: (color: ThemeColor) => {
        const theme = getTheme(color);
        applyThemeToCss(theme);
        set({ themeColor: color, theme });
      },

      setMusicVolume: (volume: number) => {
        set({ musicVolume: Math.max(0, Math.min(100, volume)) });
      },

      setSfxVolume: (volume: number) => {
        set({ sfxVolume: Math.max(0, Math.min(100, volume)) });
      },

      setReducedMotion: (enabled: boolean) => {
        set({ reducedMotion: enabled });
      },

      openSettings: () => {
        set({ isSettingsOpen: true });
      },

      closeSettings: () => {
        set({ isSettingsOpen: false });
      },

      resetToDefaults: () => {
        const theme = getTheme(DEFAULT_SETTINGS.themeColor);
        applyThemeToCss(theme);
        set({
          ...DEFAULT_SETTINGS,
          theme,
        });
      },
    }),
    {
      name: 'neon-stack-settings',
      partialize: (state) => ({
        visualVariant: state.visualVariant,
        themeColor: state.themeColor,
        musicVolume: state.musicVolume,
        sfxVolume: state.sfxVolume,
        reducedMotion: state.reducedMotion,
      }),
      onRehydrateStorage: () => (state) => {
        // Apply theme CSS on load
        if (state) {
          const theme = getTheme(state.themeColor);
          applyThemeToCss(theme);
          // Ensure theme object is set correctly after rehydration
          state.theme = theme;
        }
      },
    }
  )
);

/**
 * Initialize settings on app load.
 * Call this once at startup to apply persisted theme and sync visual variant.
 */
export function initializeSettings(): void {
  const { themeColor, visualVariant } = useSettingsStore.getState();
  const theme = getTheme(themeColor);
  applyThemeToCss(theme);
  useSettingsStore.setState({ theme });

  // Sync visual variant to visual store
  useVisualStore.getState().setVariant(visualVariant);
}
