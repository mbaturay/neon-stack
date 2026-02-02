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
  const pendingNextBlock = useGameStore((state) => state.pendingNextBlock);
  const config = useVisualStore((state) => state.config);

  // Don't render if no current block or if there's a pending block awaiting spawn
  // This prevents ghost block flicker during the frame between drop and spawn
  if (!currentBlock || pendingNextBlock) return null;

  return (
    <group>
      <Block block={currentBlock} role="moving" />
      {config.showOutline && <BlockOutline block={currentBlock} />}
      {config.showGhostGuide && <GhostGuide />}
    </group>
  );
}
