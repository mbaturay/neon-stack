/**
 * Visual effect for perfect hits - expanding ring and glow.
 */

import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@/state/gameStore';
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
  const idCounter = useRef(0);

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
            color="#00ffff"
            transparent
            opacity={ring.opacity}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}
