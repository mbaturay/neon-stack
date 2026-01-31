/**
 * Outline effect for block edges (Variant B).
 * Renders a wireframe-style outline around the top face.
 */

import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import type { Block as BlockType } from '@/core/types';
import { useVisualStore } from '@/state/visualStore';

interface BlockOutlineProps {
  block: BlockType;
}

export function BlockOutline({ block }: BlockOutlineProps) {
  const { position, dimensions } = block;
  const config = useVisualStore((state) => state.config);

  // Create outline points for top face perimeter
  const points = useMemo((): [number, number, number][] => {
    const hw = dimensions.x / 2;
    const hd = dimensions.z / 2;
    const topY = dimensions.y / 2;

    return [
      [-hw, topY, -hd],
      [hw, topY, -hd],
      [hw, topY, hd],
      [-hw, topY, hd],
      [-hw, topY, -hd], // Close the loop
    ];
  }, [dimensions]);

  return (
    <group position={[position.x, position.y, position.z]}>
      <Line
        points={points}
        color={config.outlineColor}
        lineWidth={2}
        transparent
        opacity={0.9}
      />
    </group>
  );
}
