/**
 * Visual variant state management.
 */

import { create } from 'zustand';
import type { VisualVariant, VariantConfig } from '@/rendering/VisualStyle';
import { getVariantConfig } from '@/rendering/VisualStyle';

interface VisualState {
  variant: VisualVariant;
  config: VariantConfig;
  setVariant: (variant: VisualVariant) => void;
  cycleVariant: () => void;
}

export const useVisualStore = create<VisualState>((set, get) => ({
  variant: 'A', // Default to variant A
  config: getVariantConfig('A'),

  setVariant: (variant: VisualVariant) => {
    set({
      variant,
      config: getVariantConfig(variant),
    });
  },

  cycleVariant: () => {
    const current = get().variant;
    const next: VisualVariant = current === 'A' ? 'B' : current === 'B' ? 'C' : 'A';
    get().setVariant(next);
  },
}));
