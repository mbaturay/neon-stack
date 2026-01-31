/**
 * A falling piece that animates after a block is sliced.
 * Uses theme colors for consistent styling.
 */

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import type { FallingPiece as FallingPieceType } from '@/core/types';
import { GAME_CONSTANTS } from '@/core/types';
import { useSettingsStore } from '@/state/settingsStore';
import * as THREE from 'three';

interface FallingPieceProps {
  piece: FallingPieceType;
}

const sharedGeometry = new THREE.BoxGeometry(1, 1, 1);

export function FallingPiece({ piece }: FallingPieceProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const velocityRef = useRef({ ...piece.velocity });
  const rotationRef = useRef({ x: 0, y: 0, z: 0 });
  const theme = useSettingsStore((state) => state.theme);

  // Create material with theme colors
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: theme.primary,
      emissive: theme.emissive,
      emissiveIntensity: 0.3,
      metalness: 0.1,
      roughness: 0.2,
      transparent: true,
      opacity: 0.8,
    });
  }, [theme.primary, theme.emissive]);

  // Update material colors when theme changes
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.color.set(theme.primary);
      materialRef.current.emissive.set(theme.emissive);
    }
  }, [theme.primary, theme.emissive]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    // Apply gravity
    velocityRef.current.y += GAME_CONSTANTS.GRAVITY * delta;

    // Update position
    meshRef.current.position.x += velocityRef.current.x * delta;
    meshRef.current.position.y += velocityRef.current.y * delta;
    meshRef.current.position.z += velocityRef.current.z * delta;

    // Update rotation (tumbling effect)
    rotationRef.current.x += piece.angularVelocity.x * delta;
    rotationRef.current.y += piece.angularVelocity.y * delta;
    rotationRef.current.z += piece.angularVelocity.z * delta;

    meshRef.current.rotation.x = rotationRef.current.x;
    meshRef.current.rotation.y = rotationRef.current.y;
    meshRef.current.rotation.z = rotationRef.current.z;
  });

  const { position, dimensions } = piece.block;

  return (
    <mesh
      ref={meshRef}
      position={[position.x, position.y, position.z]}
      scale={[dimensions.x, dimensions.y, dimensions.z]}
      geometry={sharedGeometry}
    >
      <primitive object={material} ref={materialRef} attach="material" />
    </mesh>
  );
}
