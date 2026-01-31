/**
 * Visual effect for perfect hits - expanding ring and glow.
 * Uses theme colors for consistent styling.
 */

import { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@/state/gameStore';
import { useSettingsStore } from '@/state/settingsStore';
import * as THREE from 'three';

interface RingEffect {
  id: number;
  position: THREE.Vector3;
  scale: number;
  opacity: number;
}

export function PerfectHitEffect() {
  const [rings, setRings] = useState<RingEffect[]>([]);
  const lastPerfectHit = useGameStore((state) => state.lastPerfectHit);
  const blocks = useGameStore((state) => state.blocks);
  const theme = useSettingsStore((state) => state.theme);
  const idCounter = useRef(0);

  // Create material with theme color
  const material = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: theme.emissive,
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide,
    });
  }, [theme.emissive]);

  // Update material color when theme changes
  useEffect(() => {
    material.color.set(theme.emissive);
  }, [theme.emissive, material]);

  // Spawn ring on perfect hit
  useEffect(() => {
    if (lastPerfectHit && blocks.length > 1) {
      const topBlock = blocks[blocks.length - 1];
      if (topBlock) {
        const newRing: RingEffect = {
          id: ++idCounter.current,
          position: new THREE.Vector3(
            topBlock.position.x,
            topBlock.position.y,
            topBlock.position.z
          ),
          scale: 1,
          opacity: 1,
        };
        setRings((prev) => [...prev, newRing]);
      }
    }
  }, [lastPerfectHit, blocks.length, blocks]);

  // Animate rings
  useFrame((_, delta) => {
    setRings((prev) =>
      prev
        .map((ring) => ({
          ...ring,
          scale: ring.scale + delta * 8,
          opacity: ring.opacity - delta * 2,
        }))
        .filter((ring) => ring.opacity > 0)
    );
  });

  return (
    <group>
      {rings.map((ring) => (
        <mesh
          key={ring.id}
          position={ring.position}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[ring.scale, ring.scale, 1]}
        >
          <ringGeometry args={[0.8, 1, 32]} />
          <meshBasicMaterial
            color={theme.emissive}
            transparent
            opacity={ring.opacity}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}
