/**
 * VFX Controller
 * React component that integrates the VFX system with the R3F scene.
 * Handles initialization, updates, theme changes, and game events.
 */

import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getVFXManager, resetVFXManager } from '@/game/vfx';
import { useSettingsStore } from '@/state/settingsStore';
import { useGameStore } from '@/state/gameStore';

export function VFXController() {
  const { scene } = useThree();
  const vfxManager = getVFXManager();
  const initializedRef = useRef(false);

  // Get theme for color updates
  const theme = useSettingsStore((state) => state.theme);

  // Get game state for event detection
  const phase = useGameStore((state) => state.phase);
  const lastPerfectHit = useGameStore((state) => state.lastPerfectHit);
  const blocks = useGameStore((state) => state.blocks);
  const fallingPieces = useGameStore((state) => state.fallingPieces);

  // Track previous state for change detection
  const prevPhaseRef = useRef(phase);
  const prevBlockCountRef = useRef(blocks.length);
  const prevFallingCountRef = useRef(fallingPieces.length);
  const prevLastPerfectRef = useRef(lastPerfectHit);

  // Initialize VFX manager once
  useEffect(() => {
    if (!initializedRef.current) {
      vfxManager.init(scene);
      vfxManager.setThemeColor(theme.emissive);
      initializedRef.current = true;
    }

    // Cleanup on unmount
    return () => {
      resetVFXManager();
      initializedRef.current = false;
    };
  }, [scene, vfxManager, theme.emissive]);

  // Update theme color when it changes
  useEffect(() => {
    if (initializedRef.current) {
      vfxManager.setThemeColor(theme.emissive);
    }
  }, [theme.emissive, vfxManager]);

  // Detect game events and trigger VFX
  useEffect(() => {
    // Game over detection
    if (prevPhaseRef.current === 'playing' && phase === 'gameover') {
      const topBlock = blocks[blocks.length - 1];
      const stackHeight = topBlock
        ? topBlock.position.y + topBlock.dimensions.y / 2
        : 0;
      vfxManager.onGameOver({ stackHeight });
    }

    // Game restart detection
    if (prevPhaseRef.current === 'gameover' && phase === 'playing') {
      vfxManager.onRestart();
    }

    // Also restart from idle
    if (prevPhaseRef.current === 'idle' && phase === 'playing') {
      vfxManager.onRestart();
    }

    prevPhaseRef.current = phase;
  }, [phase, blocks, vfxManager]);

  // Perfect hit detection
  useEffect(() => {
    if (
      lastPerfectHit &&
      !prevLastPerfectRef.current &&
      blocks.length > 1
    ) {
      const topBlock = blocks[blocks.length - 1];
      if (topBlock) {
        vfxManager.onPerfect({
          position: new THREE.Vector3(
            topBlock.position.x,
            topBlock.position.y,
            topBlock.position.z
          ),
          size: new THREE.Vector3(
            topBlock.dimensions.x,
            topBlock.dimensions.y,
            topBlock.dimensions.z
          ),
          topY: topBlock.position.y + topBlock.dimensions.y / 2,
        });
      }
    }

    prevLastPerfectRef.current = lastPerfectHit;
  }, [lastPerfectHit, blocks, vfxManager]);

  // Slice detection (new falling piece = slice happened)
  useEffect(() => {
    const newPieceCount = fallingPieces.length;
    const prevCount = prevFallingCountRef.current;

    // A new falling piece was added (slice occurred)
    if (
      newPieceCount > prevCount &&
      blocks.length > 0 &&
      !lastPerfectHit // Don't flash on perfect (no slice)
    ) {
      // Get the newest falling piece
      const newPiece = fallingPieces[fallingPieces.length - 1];
      const topBlock = blocks[blocks.length - 1];

      if (newPiece && topBlock) {
        // Determine which axis the cut was on based on block dimensions difference
        // The fallen piece and kept block will differ in size on the cut axis
        const axis: 'x' | 'z' =
          Math.abs(newPiece.block.position.x - topBlock.position.x) > 0.01
            ? 'x'
            : 'z';

        // Calculate cut position (at the boundary between kept and fallen)
        const cutX =
          axis === 'x'
            ? (topBlock.position.x +
                topBlock.dimensions.x / 2 *
                  Math.sign(newPiece.block.position.x - topBlock.position.x) +
                newPiece.block.position.x -
                newPiece.block.dimensions.x / 2 *
                  Math.sign(newPiece.block.position.x - topBlock.position.x)) /
              2
            : topBlock.position.x;

        const cutZ =
          axis === 'z'
            ? (topBlock.position.z +
                topBlock.dimensions.z / 2 *
                  Math.sign(newPiece.block.position.z - topBlock.position.z) +
                newPiece.block.position.z -
                newPiece.block.dimensions.z / 2 *
                  Math.sign(newPiece.block.position.z - topBlock.position.z)) /
              2
            : topBlock.position.z;

        const cutLength = axis === 'x' ? topBlock.dimensions.z : topBlock.dimensions.x;
        const cutY = topBlock.position.y + topBlock.dimensions.y / 2;

        vfxManager.onSlice({
          cutPosition: new THREE.Vector3(cutX, cutY, cutZ),
          cutLength,
          axis,
          cutY,
        });
      }
    }

    prevFallingCountRef.current = newPieceCount;
    prevBlockCountRef.current = blocks.length;
  }, [fallingPieces, blocks, lastPerfectHit, vfxManager]);

  // Update VFX manager each frame
  useFrame((_, delta) => {
    if (initializedRef.current) {
      vfxManager.update(delta * 1000); // Convert to ms
    }
  });

  // This component renders nothing directly
  return null;
}
