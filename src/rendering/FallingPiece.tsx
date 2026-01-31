/**
 * A falling piece that animates after a block is sliced.
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { FallingPiece as FallingPieceType } from '@/core/types';
import { GAME_CONSTANTS } from '@/core/types';
import * as THREE from 'three';

interface FallingPieceProps {
  piece: FallingPieceType;
}

const sharedGeometry = new THREE.BoxGeometry(1, 1, 1);

export function FallingPiece({ piece }: FallingPieceProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const velocityRef = useRef({ ...piece.velocity });
  const rotationRef = useRef({ x: 0, y: 0, z: 0 });

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
      <meshStandardMaterial
        color="#00ddff"
        emissive="#00ffff"
        emissiveIntensity={0.3}
        metalness={0.1}
        roughness={0.2}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}
