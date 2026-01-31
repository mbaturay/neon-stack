/**
 * Manages game loop within the R3F context.
 */

import { useGameLoop } from '@/hooks/useGameLoop';

export function GameController() {
  useGameLoop();
  return null;
}
