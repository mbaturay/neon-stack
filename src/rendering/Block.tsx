/**
 * Single block mesh component with variant-aware styling.
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Block as BlockType } from '@/core/types';
import { useVisualStore } from '@/state/visualStore';
import type { BlockStyle } from './VisualStyle';
import * as THREE from 'three';

type BlockRole = 'moving' | 'stacked' | 'topStacked';

interface BlockProps {
  block: BlockType;
  role?: BlockRole;
}

// Shared geometry to reduce draw calls
const sharedGeometry = new THREE.BoxGeometry(1, 1, 1);

function createMaterial(style: BlockStyle): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: style.color,
    emissive: style.emissive,
    emissiveIntensity: style.emissiveIntensity,
    metalness: style.metalness,
    roughness: style.roughness,
    transparent: style.opacity < 1,
    opacity: style.opacity,
  });
}

export function Block({ block, role = 'stacked' }: BlockProps) {
  const { position, dimensions } = block;
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const config = useVisualStore((state) => state.config);

  // Get base style based on role
  const baseStyle = useMemo(() => {
    switch (role) {
      case 'moving':
        return config.movingBlock;
      case 'topStacked':
        return config.topStackedBlock;
      default:
        return config.stackedBlock;
    }
  }, [role, config]);

  // Create material
  const material = useMemo(() => createMaterial(baseStyle), [baseStyle]);

  // Handle pulsing for moving block (Variant A)
  useFrame((state) => {
    if (role === 'moving' && config.movingBlockPulse && materialRef.current) {
      const pulse =
        Math.sin(state.clock.elapsedTime * config.movingBlockPulseSpeed) * 0.5 + 0.5;
      const intensity =
        baseStyle.emissiveIntensity +
        pulse * config.movingBlockPulseAmount;
      materialRef.current.emissiveIntensity = intensity;
    }
  });

  return (
    <mesh
      position={[position.x, position.y, position.z]}
      scale={[dimensions.x, dimensions.y, dimensions.z]}
      geometry={sharedGeometry}
    >
      <primitive object={material} ref={materialRef} attach="material" />
    </mesh>
  );
}
