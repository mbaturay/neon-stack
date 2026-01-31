/**
 * Ghost guide showing projected overlap area (Variant C).
 * Renders a faint outline on top of the stack showing where the block will land.
 */

import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { useGameStore } from '@/state/gameStore';
import { useVisualStore } from '@/state/visualStore';
import { calculateAxisOverlap } from '@/core/geometry';
import { GAME_CONSTANTS } from '@/core/types';
import * as THREE from 'three';

export function GhostGuide() {
  const currentBlock = useGameStore((state) => state.currentBlock);
  const blocks = useGameStore((state) => state.blocks);
  const movingAxis = useGameStore((state) => state.movingAxis);
  const config = useVisualStore((state) => state.config);

  // Calculate the overlap region
  const overlapData = useMemo(() => {
    if (!currentBlock || blocks.length === 0) return null;

    const topBlock = blocks[blocks.length - 1];
    if (!topBlock) return null;

    const axis = movingAxis;
    const movingPos = currentBlock.position[axis];
    const movingSize = currentBlock.dimensions[axis === 'x' ? 'x' : 'z'];
    const basePos = topBlock.position[axis];
    const baseSize = topBlock.dimensions[axis === 'x' ? 'x' : 'z'];

    const overlap = calculateAxisOverlap(movingPos, movingSize, basePos, baseSize);
    if (!overlap) return null;

    // Calculate dimensions of the overlap rectangle
    const overlapCenter = (overlap.min + overlap.max) / 2;
    const overlapSize = overlap.size;

    // Position on top of the stack
    const y = topBlock.position.y + GAME_CONSTANTS.BLOCK_HEIGHT / 2 + 0.01;

    // Dimensions depend on which axis is moving
    const width = axis === 'x' ? overlapSize : currentBlock.dimensions.x;
    const depth = axis === 'z' ? overlapSize : currentBlock.dimensions.z;
    const x = axis === 'x' ? overlapCenter : currentBlock.position.x;
    const z = axis === 'z' ? overlapCenter : currentBlock.position.z;

    return { x, y, z, width, depth };
  }, [currentBlock, blocks, movingAxis]);

  // Create outline points
  const outlinePoints = useMemo((): [number, number, number][] | null => {
    if (!overlapData) return null;

    const hw = overlapData.width / 2;
    const hd = overlapData.depth / 2;

    return [
      [-hw, 0, -hd],
      [hw, 0, -hd],
      [hw, 0, hd],
      [-hw, 0, hd],
      [-hw, 0, -hd],
    ];
  }, [overlapData]);

  if (!overlapData || !outlinePoints) return null;

  return (
    <group position={[overlapData.x, overlapData.y, overlapData.z]}>
      {/* Thin outline */}
      <Line
        points={outlinePoints}
        color={config.ghostGuideColor}
        lineWidth={1}
        transparent
        opacity={config.ghostGuideOpacity}
        depthTest={false}
      />

      {/* Very subtle filled plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[overlapData.width, overlapData.depth]} />
        <meshBasicMaterial
          color={config.ghostGuideColor}
          transparent
          opacity={config.ghostGuideOpacity * 0.3}
          side={THREE.DoubleSide}
          depthTest={false}
        />
      </mesh>
    </group>
  );
}
