/**
 * Small indicator showing current visual variant.
 * For dev/evaluation use.
 */

import { useVisualStore } from '@/state/visualStore';
import styles from './styles/VariantIndicator.module.css';

export function VariantIndicator() {
  const variant = useVisualStore((state) => state.variant);
  const config = useVisualStore((state) => state.config);

  return (
    <div className={styles['container']}>
      <div className={styles['badge']}>
        <span className={styles['key']}>{variant}</span>
        <span className={styles['name']}>{config.name}</span>
      </div>
      <div className={styles['hint']}>Press 1, 2, 3 to switch</div>
    </div>
  );
}
