/**
 * Mobile-friendly visual variant switcher.
 * Uses pointer events with propagation prevention to avoid triggering game drops.
 */

import { useVisualStore } from '@/state/visualStore';
import { useSettingsStore } from '@/state/settingsStore';
import type { VisualVariant } from '@/rendering/VisualStyle';
import styles from './styles/StyleSwitcher.module.css';

const VARIANTS: VisualVariant[] = ['A', 'B', 'C'];

export function StyleSwitcher() {
  const currentVariant = useVisualStore((state) => state.variant);
  const setVariant = useVisualStore((state) => state.setVariant);
  const setVisualVariant = useSettingsStore((state) => state.setVisualVariant);

  /**
   * Handle variant button press.
   * Uses onPointerDown for immediate response and to prevent ghost click issues.
   * Stops propagation to prevent triggering game drop.
   */
  const handleVariantSelect = (
    e: React.PointerEvent<HTMLButtonElement>,
    variant: VisualVariant
  ) => {
    // Prevent default browser behavior
    e.preventDefault();
    // Stop event from bubbling up to game input handler
    e.stopPropagation();

    // Update both stores
    setVariant(variant);
    setVisualVariant(variant);
  };

  return (
    <div className={styles['container']}>
      {/* Segmented control with A/B/C buttons */}
      <div
        className={styles['segmentedControl']}
        data-no-game-input
      >
        {VARIANTS.map((variant) => {
          const isActive = currentVariant === variant;
          return (
            <button
              key={variant}
              type="button"
              className={`${styles['segment']} ${isActive ? styles['active'] : ''}`}
              onPointerDown={(e) => handleVariantSelect(e, variant)}
              data-no-game-input
              aria-label={`Visual style ${variant}`}
              {...(isActive ? { 'aria-pressed': 'true' } : { 'aria-pressed': 'false' })}
            >
              {variant}
            </button>
          );
        })}
      </div>
      <div className={styles['hint']}>STYLE</div>
    </div>
  );
}
