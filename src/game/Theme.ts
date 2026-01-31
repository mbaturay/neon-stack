/**
 * Theme color definitions shared between Three.js and UI.
 * Single source of truth for all color-related theming.
 *
 * All visual effects MUST use these tokens - no hardcoded colors in effect code.
 */

export type ThemeColor = 'cyan' | 'magenta' | 'green' | 'orange' | 'purple';

export interface ThemeColors {
  /** Primary color for blocks and UI accents */
  primary: string;
  /** Darker shade for stacked blocks */
  primaryDark: string;
  /** Even darker shade for deep stack blocks */
  primaryDeep: string;
  /** Emissive/glow color for Three.js materials */
  emissive: string;
  /** Light accent for highlights, outlines, ghost guides */
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

// Cyan - Default theme (#00F6FF)
const THEME_CYAN: ThemeColors = {
  primary: '#00F6FF',
  primaryDark: '#008899',
  primaryDeep: '#006677',
  emissive: '#00F6FF',
  accent: '#66FFFF',
  gridCell: '#005566',
  gridSection: '#00AACC',
  hudColor: '#00F6FF',
  hudGlow: 'rgba(0, 246, 255, 0.5)',
  hudBackground: 'rgba(0, 246, 255, 0.1)',
};

// Magenta (#FF2D95)
const THEME_MAGENTA: ThemeColors = {
  primary: '#FF2D95',
  primaryDark: '#99195A',
  primaryDeep: '#66113D',
  emissive: '#FF2D95',
  accent: '#FF7DC0',
  gridCell: '#551040',
  gridSection: '#CC2477',
  hudColor: '#FF2D95',
  hudGlow: 'rgba(255, 45, 149, 0.5)',
  hudBackground: 'rgba(255, 45, 149, 0.1)',
};

// Neon Green (#2BFF88)
const THEME_GREEN: ThemeColors = {
  primary: '#2BFF88',
  primaryDark: '#1A9952',
  primaryDeep: '#116637',
  emissive: '#2BFF88',
  accent: '#7FFFC0',
  gridCell: '#1A5540',
  gridSection: '#22CC6D',
  hudColor: '#2BFF88',
  hudGlow: 'rgba(43, 255, 136, 0.5)',
  hudBackground: 'rgba(43, 255, 136, 0.1)',
};

// Neon Orange (#FF9F1C)
const THEME_ORANGE: ThemeColors = {
  primary: '#FF9F1C',
  primaryDark: '#995F11',
  primaryDeep: '#66400B',
  emissive: '#FF9F1C',
  accent: '#FFCC7A',
  gridCell: '#554010',
  gridSection: '#CC7F16',
  hudColor: '#FF9F1C',
  hudGlow: 'rgba(255, 159, 28, 0.5)',
  hudBackground: 'rgba(255, 159, 28, 0.1)',
};

// Neon Purple (#8B5CF6)
const THEME_PURPLE: ThemeColors = {
  primary: '#8B5CF6',
  primaryDark: '#533894',
  primaryDeep: '#372562',
  emissive: '#8B5CF6',
  accent: '#B794F9',
  gridCell: '#352860',
  gridSection: '#6F4AC5',
  hudColor: '#8B5CF6',
  hudGlow: 'rgba(139, 92, 246, 0.5)',
  hudBackground: 'rgba(139, 92, 246, 0.1)',
};

export const THEMES: Record<ThemeColor, ThemeColors> = {
  cyan: THEME_CYAN,
  magenta: THEME_MAGENTA,
  green: THEME_GREEN,
  orange: THEME_ORANGE,
  purple: THEME_PURPLE,
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
