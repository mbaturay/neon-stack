/**
 * Displays combo messages for perfect hit streaks.
 */

import { useState, useEffect } from 'react';
import { useGameStore } from '@/state/gameStore';
import { getStreakMessage } from '@/core/scoring';
import styles from './styles/ComboIndicator.module.css';

interface ComboDisplay {
  id: number;
  message: string;
}

export function ComboIndicator() {
  const [displays, setDisplays] = useState<ComboDisplay[]>([]);
  const perfectStreak = useGameStore((state) => state.perfectStreak);
  const lastPerfectHit = useGameStore((state) => state.lastPerfectHit);

  useEffect(() => {
    if (lastPerfectHit) {
      const message = getStreakMessage(perfectStreak);
      if (message) {
        const newDisplay: ComboDisplay = {
          id: Date.now(),
          message,
        };
        setDisplays((prev) => [...prev, newDisplay]);

        // Remove after animation
        setTimeout(() => {
          setDisplays((prev) => prev.filter((d) => d.id !== newDisplay.id));
        }, 1000);
      }
    }
  }, [lastPerfectHit, perfectStreak]);

  return (
    <div className={styles['container']}>
      {displays.map((display) => (
        <div key={display.id} className={styles['combo']}>
          {display.message}
        </div>
      ))}
    </div>
  );
}
