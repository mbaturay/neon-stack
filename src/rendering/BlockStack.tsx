/**
 * Renders all placed blocks in the stack.
 */

import { useGameStore } from '@/state/gameStore';
import { useVisualStore } from '@/state/visualStore';
import { Block } from './Block';
import { BlockOutline } from './BlockOutline';

export function BlockStack() {
  const blocks = useGameStore((state) => state.blocks);
  const config = useVisualStore((state) => state.config);

  return (
    <group>
      {blocks.map((block, index) => {
        const isTop = index === blocks.length - 1;
        return (
          <group key={block.id}>
            <Block
              block={block}
              role={isTop ? 'topStacked' : 'stacked'}
            />
            {/* Outline for variant B - only on top block */}
            {config.showOutline && isTop && (
              <BlockOutline block={block} />
            )}
          </group>
        );
      })}
    </group>
  );
}
