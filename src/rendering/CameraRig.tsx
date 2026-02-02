/**
 * Camera controller that smoothly follows the stack height.
 * Both position and lookAt target are interpolated for smooth movement.
 * On idle launch screen and game over, slowly zooms out and orbits around the structure.
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

// Game over camera settings
const GAMEOVER_ZOOM_OUT_DISTANCE = 20;  // How far to zoom out
const GAMEOVER_LERP = 0.008;  // Very slow transition for dramatic effect
const GAMEOVER_ORBIT_SPEED = 0.15;  // Radians per second for slow orbit

export function CameraRig() {
  const { camera } = useThree();
  const currentPosY = useRef(CAMERA_HEIGHT_OFFSET);
  const currentLookAtY = useRef(0);
  const currentDistance = useRef(CAMERA_DISTANCE);
  const orbitAngle = useRef(Math.PI / 4);  // Start at 45 degrees (diagonal view)

  const blocks = useGameStore((state) => state.blocks);
  const phase = useGameStore((state) => state.phase);

  useFrame((_, delta) => {
    const stackHeight = blocks.length * GAME_CONSTANTS.BLOCK_HEIGHT;

    if (phase === 'idle' || phase === 'gameover') {
      // Idle/Game over: slowly zoom out and orbit around the structure
      const structureCenterY = phase === 'idle' ? 2 : stackHeight / 2;
      const targetDistance = phase === 'idle'
        ? GAMEOVER_ZOOM_OUT_DISTANCE
        : GAMEOVER_ZOOM_OUT_DISTANCE + stackHeight * 0.5;
      const targetPosY = structureCenterY + CAMERA_HEIGHT_OFFSET * 0.5;

      // Slowly interpolate to cinematic view
      currentDistance.current = THREE.MathUtils.lerp(
        currentDistance.current,
        targetDistance,
        GAMEOVER_LERP
      );
      currentPosY.current = THREE.MathUtils.lerp(
        currentPosY.current,
        targetPosY,
        GAMEOVER_LERP
      );
      currentLookAtY.current = THREE.MathUtils.lerp(
        currentLookAtY.current,
        structureCenterY,
        GAMEOVER_LERP
      );

      // Slowly orbit around the structure
      orbitAngle.current += GAMEOVER_ORBIT_SPEED * delta;

      // Calculate orbital position
      const x = Math.sin(orbitAngle.current) * currentDistance.current;
      const z = Math.cos(orbitAngle.current) * currentDistance.current;

      camera.position.set(x, currentPosY.current, z);
      camera.lookAt(0, currentLookAtY.current, 0);
    } else {
      // Normal gameplay: follow the stack
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

      // Reset distance and orbit for normal gameplay
      currentDistance.current = THREE.MathUtils.lerp(
        currentDistance.current,
        CAMERA_DISTANCE,
        POSITION_LERP
      );
      orbitAngle.current = Math.PI / 4;  // Reset to diagonal view

      // Update camera
      camera.position.set(CAMERA_DISTANCE, currentPosY.current, CAMERA_DISTANCE);
      camera.lookAt(0, currentLookAtY.current, 0);
    }
  });

  return null;
}
