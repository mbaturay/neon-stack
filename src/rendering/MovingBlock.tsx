/**
 * The currently oscillating block that the player controls.
 */

import { useGameStore } from '@/state/gameStore';
import { useVisualStore } from '@/state/visualStore';
import { Block } from './Block';
import { BlockOutline } from './BlockOutline';
import { GhostGuide } from './GhostGuide';

export function MovingBlock() {
  const currentBlock = useGameStore((state) => state.currentBlock);
  const config = useVisualStore((state) => state.config);

  if (!currentBlock) return null;

  return (
    <group>
      <Block block={currentBlock} role="moving" />
      {config.showOutline && <BlockOutline block={currentBlock} />}
      {config.showGhostGuide && <GhostGuide />}
    </group>
  );
}
