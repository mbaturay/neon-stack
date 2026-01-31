/**
 * Theme color definitions shared between Three.js and UI.
 * Single source of truth for all color-related theming.
 */

export type ThemeColor = 'cyan' | 'red' | 'green' | 'orange';

export interface ThemeColors {
  /** Primary color for blocks and UI accents */
  primary: string;
  /** Darker shade for stacked blocks */
  primaryDark: string;
  /** Even darker shade for deep stack blocks */
  primaryDeep: string;
  /** Emissive/glow color */
  emissive: string;
  /** Light accent for highlights */
  accent: string;
  /** Grid cell color */
  gridCell: string;
  /** Grid section color */
  gridSection: string;
  /** CSS color for HUD elements */
  hudColor: string;
  /** CSS rgba for glows and shadows */
  hudGlow: string;
  /** CSS rgba for subtle backgrounds */
  hudBackground: string;
}

const THEME_CYAN: ThemeColors = {
  primary: '#00ddff',
  primaryDark: '#008899',
  primaryDeep: '#006677',
  emissive: '#00ffff',
  accent: '#66ffff',
  gridCell: '#005566',
  gridSection: '#00aacc',
  hudColor: '#00ffff',
  hudGlow: 'rgba(0, 255, 255, 0.5)',
  hudBackground: 'rgba(0, 255, 255, 0.1)',
};

const THEME_RED: ThemeColors = {
  primary: '#ff4466',
  primaryDark: '#992233',
  primaryDeep: '#661122',
  emissive: '#ff6688',
  accent: '#ff99aa',
  gridCell: '#552233',
  gridSection: '#cc4466',
  hudColor: '#ff6688',
  hudGlow: 'rgba(255, 102, 136, 0.5)',
  hudBackground: 'rgba(255, 102, 136, 0.1)',
};

const THEME_GREEN: ThemeColors = {
  primary: '#44ff88',
  primaryDark: '#229955',
  primaryDeep: '#116633',
  emissive: '#66ffaa',
  accent: '#99ffcc',
  gridCell: '#225544',
  gridSection: '#44cc77',
  hudColor: '#66ffaa',
  hudGlow: 'rgba(102, 255, 170, 0.5)',
  hudBackground: 'rgba(102, 255, 170, 0.1)',
};

const THEME_ORANGE: ThemeColors = {
  primary: '#ffaa44',
  primaryDark: '#996622',
  primaryDeep: '#664411',
  emissive: '#ffcc66',
  accent: '#ffdd99',
  gridCell: '#554422',
  gridSection: '#cc8844',
  hudColor: '#ffcc66',
  hudGlow: 'rgba(255, 204, 102, 0.5)',
  hudBackground: 'rgba(255, 204, 102, 0.1)',
};

export const THEMES: Record<ThemeColor, ThemeColors> = {
  cyan: THEME_CYAN,
  red: THEME_RED,
  green: THEME_GREEN,
  orange: THEME_ORANGE,
};

export function getTheme(color: ThemeColor): ThemeColors {
  return THEMES[color];
}

/**
 * Apply theme colors as CSS custom properties on the document root.
 * Call this whenever the theme changes.
 */
export function applyThemeToCss(theme: ThemeColors): void {
  const root = document.documentElement;
  root.style.setProperty('--theme-primary', theme.hudColor);
  root.style.setProperty('--theme-glow', theme.hudGlow);
  root.style.setProperty('--theme-background', theme.hudBackground);
}

export type BlockColorRole = 'moving' | 'topStacked' | 'stacked';

export interface ThemedBlockColors {
  color: string;
  emissive: string;
}

/**
 * Get themed block colors based on block role.
 * This applies theme colors while preserving relative brightness per role.
 */
export function getThemedBlockColors(
  theme: ThemeColors,
  role: BlockColorRole
): ThemedBlockColors {
  switch (role) {
    case 'moving':
      return {
        color: theme.primary,
        emissive: theme.emissive,
      };
    case 'topStacked':
      return {
        color: theme.primary,
        emissive: theme.emissive,
      };
    case 'stacked':
    default:
      return {
        color: theme.primaryDark,
        emissive: theme.primaryDeep,
      };
  }
}
