/**
 * Camera controller that smoothly follows the stack height.
 * Both position and lookAt target are interpolated for smooth movement.
 */

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGameStore } from '@/state/gameStore';
import { GAME_CONSTANTS } from '@/core/types';
import * as THREE from 'three';

const CAMERA_DISTANCE = 12;
const CAMERA_HEIGHT_OFFSET = 8;
const POSITION_LERP = 0.04;  // Smooth camera position movement
const LOOKAT_LERP = 0.06;    // Slightly faster lookAt to feel responsive

export function CameraRig() {
  const { camera } = useThree();
  const currentPosY = useRef(CAMERA_HEIGHT_OFFSET);
  const currentLookAtY = useRef(0);
  const blocks = useGameStore((state) => state.blocks);

  useFrame(() => {
    // Calculate targets based on stack height
    const stackHeight = blocks.length * GAME_CONSTANTS.BLOCK_HEIGHT;
    const targetPosY = stackHeight + CAMERA_HEIGHT_OFFSET;
    const targetLookAtY = stackHeight;

    // Smooth lerp both position and lookAt target
    currentPosY.current = THREE.MathUtils.lerp(
      currentPosY.current,
      targetPosY,
      POSITION_LERP
    );
    currentLookAtY.current = THREE.MathUtils.lerp(
      currentLookAtY.current,
      targetLookAtY,
      LOOKAT_LERP
    );

    // Update camera
    camera.position.set(CAMERA_DISTANCE, currentPosY.current, CAMERA_DISTANCE);
    camera.lookAt(0, currentLookAtY.current, 0);
  });

  return null;
}
