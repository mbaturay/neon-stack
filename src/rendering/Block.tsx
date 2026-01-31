/**
 * Single block mesh component with variant-aware styling and theme colors.
 */

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Block as BlockType } from '@/core/types';
import { useVisualStore } from '@/state/visualStore';
import { useSettingsStore } from '@/state/settingsStore';
import { getThemedBlockColors } from '@/game/Theme';
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
  const theme = useSettingsStore((state) => state.theme);
  const reducedMotion = useSettingsStore((state) => state.reducedMotion);

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

  // Get theme-adjusted colors
  const themeColors = useMemo(
    () => getThemedBlockColors(theme, role),
    [theme, role]
  );

  // Create material with theme colors
  const material = useMemo(() => {
    const themedStyle: BlockStyle = {
      ...baseStyle,
      color: themeColors.color,
      emissive: themeColors.emissive,
    };
    return createMaterial(themedStyle);
  }, [baseStyle, themeColors]);

  // Update material colors when theme changes
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.color.set(themeColors.color);
      materialRef.current.emissive.set(themeColors.emissive);
    }
  }, [themeColors]);

  // Handle pulsing for moving block (Variant A, respects reduced motion)
  useFrame((state) => {
    if (
      role === 'moving' &&
      config.movingBlockPulse &&
      !reducedMotion &&
      materialRef.current
    ) {
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
