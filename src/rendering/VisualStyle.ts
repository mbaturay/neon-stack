/**
 * Centralized visual style definitions for clarity variants.
 */

export type VisualVariant = 'A' | 'B' | 'C';

export interface BlockStyle {
  color: string;
  emissive: string;
  emissiveIntensity: number;
  metalness: number;
  roughness: number;
  opacity: number;
}

export interface VariantConfig {
  name: string;
  description: string;

  // Moving block
  movingBlock: BlockStyle;
  movingBlockPulse: boolean;
  movingBlockPulseSpeed: number;
  movingBlockPulseAmount: number;

  // Stacked blocks
  stackedBlock: BlockStyle;
  topStackedBlock: BlockStyle; // Top of stack may differ

  // Top face (variant B)
  topFaceBrighter: boolean;
  topFaceBrightnessMultiplier: number;
  sideFaceDarker: boolean;
  sideFaceDarknessMultiplier: number;

  // Outline (variant B)
  showOutline: boolean;
  outlineColor: string;
  outlineWidth: number;

  // Grid
  gridOpacity: number;
  gridBloom: boolean;

  // Ghost guide (variant C)
  showGhostGuide: boolean;
  ghostGuideColor: string;
  ghostGuideOpacity: number;

  // Fog
  fogNearOffset: number;
  fogEnabled: boolean;

  // Bloom adjustments
  bloomIntensity: number;
}

const BASE_MOVING_BLOCK: BlockStyle = {
  color: '#00ddff',
  emissive: '#00ffff',
  emissiveIntensity: 0.5,
  metalness: 0.1,
  roughness: 0.2,
  opacity: 1,
};

const BASE_STACKED_BLOCK: BlockStyle = {
  color: '#00ddff',
  emissive: '#00ffff',
  emissiveIntensity: 0.3,
  metalness: 0.1,
  roughness: 0.2,
  opacity: 1,
};

/**
 * Variant A: Active Highlight
 * - Moving block has hue shift + emissive pulse
 * - Stacked blocks are static and darker
 * - Grid has no bloom, reduced opacity
 */
const VARIANT_A: VariantConfig = {
  name: 'Active Highlight',
  description: 'Pulsing moving block, darker stack',

  movingBlock: {
    ...BASE_MOVING_BLOCK,
    color: '#22ffee', // Slight hue shift toward green
    emissive: '#00ffff',
    emissiveIntensity: 0.6,
  },
  movingBlockPulse: true,
  movingBlockPulseSpeed: 3,
  movingBlockPulseAmount: 0.3,

  stackedBlock: {
    ...BASE_STACKED_BLOCK,
    color: '#008899',
    emissive: '#006677',
    emissiveIntensity: 0.15,
  },
  topStackedBlock: {
    ...BASE_STACKED_BLOCK,
    color: '#00aabb',
    emissive: '#008899',
    emissiveIntensity: 0.2,
  },

  topFaceBrighter: false,
  topFaceBrightnessMultiplier: 1,
  sideFaceDarker: false,
  sideFaceDarknessMultiplier: 1,

  showOutline: false,
  outlineColor: '#00ffff',
  outlineWidth: 0.02,

  gridOpacity: 0.3,
  gridBloom: false,

  showGhostGuide: false,
  ghostGuideColor: '#00ffff',
  ghostGuideOpacity: 0.3,

  fogNearOffset: 0,
  fogEnabled: false,

  bloomIntensity: 1.2,
};

/**
 * Variant B: Top-Face Clarity
 * - Strong outline around top face perimeter
 * - Top face brighter, sides darker
 * - Reduced fog near stack
 */
const VARIANT_B: VariantConfig = {
  name: 'Top-Face Clarity',
  description: 'Outlined top face, darker sides',

  movingBlock: {
    ...BASE_MOVING_BLOCK,
    emissiveIntensity: 0.4,
  },
  movingBlockPulse: false,
  movingBlockPulseSpeed: 0,
  movingBlockPulseAmount: 0,

  stackedBlock: {
    ...BASE_STACKED_BLOCK,
    color: '#006688',
    emissive: '#004455',
    emissiveIntensity: 0.1,
  },
  topStackedBlock: {
    ...BASE_STACKED_BLOCK,
    color: '#00bbcc',
    emissive: '#00ffff',
    emissiveIntensity: 0.35,
  },

  topFaceBrighter: true,
  topFaceBrightnessMultiplier: 1.5,
  sideFaceDarker: true,
  sideFaceDarknessMultiplier: 0.5,

  showOutline: true,
  outlineColor: '#66ffff',
  outlineWidth: 0.03,

  gridOpacity: 0.5,
  gridBloom: true,

  showGhostGuide: false,
  ghostGuideColor: '#00ffff',
  ghostGuideOpacity: 0.3,

  fogNearOffset: 5,
  fogEnabled: true,

  bloomIntensity: 1.0,
};

/**
 * Variant C: Ghost Guide
 * - Faint ghost showing overlap area
 * - Subtle, thin, no bloom on ghost
 * - Appears only during alignment
 */
const VARIANT_C: VariantConfig = {
  name: 'Ghost Guide',
  description: 'Projected overlap preview',

  movingBlock: {
    ...BASE_MOVING_BLOCK,
    emissiveIntensity: 0.4,
  },
  movingBlockPulse: false,
  movingBlockPulseSpeed: 0,
  movingBlockPulseAmount: 0,

  stackedBlock: {
    ...BASE_STACKED_BLOCK,
    emissiveIntensity: 0.25,
  },
  topStackedBlock: {
    ...BASE_STACKED_BLOCK,
    emissiveIntensity: 0.3,
  },

  topFaceBrighter: false,
  topFaceBrightnessMultiplier: 1,
  sideFaceDarker: false,
  sideFaceDarknessMultiplier: 1,

  showOutline: false,
  outlineColor: '#00ffff',
  outlineWidth: 0.02,

  gridOpacity: 0.5,
  gridBloom: true,

  showGhostGuide: true,
  ghostGuideColor: '#44ffaa',
  ghostGuideOpacity: 0.25,

  fogNearOffset: 0,
  fogEnabled: false,

  bloomIntensity: 1.5,
};

export const VARIANTS: Record<VisualVariant, VariantConfig> = {
  A: VARIANT_A,
  B: VARIANT_B,
  C: VARIANT_C,
};

export function getVariantConfig(variant: VisualVariant): VariantConfig {
  return VARIANTS[variant];
}
