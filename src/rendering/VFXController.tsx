/**
 * VFX Controller
 * React component that integrates VFX and Audio systems with the R3F scene.
 * Handles initialization, updates, theme changes, and game events.
 */

import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getVFXManager, resetVFXManager } from '@/game/vfx';
import { getAudioManager } from '@/audio';
import { useSettingsStore } from '@/state/settingsStore';
import { useGameStore } from '@/state/gameStore';

export function VFXController() {
  const { scene } = useThree();
  const vfxManager = getVFXManager();
  const audioManager = getAudioManager();
  const initializedRef = useRef(false);

  // Get theme for color updates
  const theme = useSettingsStore((state) => state.theme);

  // Get volume settings for audio
  const sfxVolume = useSettingsStore((state) => state.sfxVolume);
  const musicVolume = useSettingsStore((state) => state.musicVolume);

  // Get game state for event detection
  const phase = useGameStore((state) => state.phase);
  const lastPerfectHit = useGameStore((state) => state.lastPerfectHit);
  const perfectStreak = useGameStore((state) => state.perfectStreak);
  const blocks = useGameStore((state) => state.blocks);
  const fallingPieces = useGameStore((state) => state.fallingPieces);

  // Track previous state for change detection
  const prevPhaseRef = useRef(phase);
  const prevBlockCountRef = useRef(blocks.length);
  const prevFallingCountRef = useRef(fallingPieces.length);
  const prevLastPerfectRef = useRef(lastPerfectHit);
  const prevPerfectStreakRef = useRef(perfectStreak);

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

  // Sync audio volumes with settings
  useEffect(() => {
    audioManager.setSfxVolume(sfxVolume);
  }, [sfxVolume, audioManager]);

  useEffect(() => {
    audioManager.setMusicVolume(musicVolume);
  }, [musicVolume, audioManager]);

  // Detect game events and trigger VFX + Audio
  useEffect(() => {
    // Game over detection
    if (prevPhaseRef.current === 'playing' && phase === 'gameover') {
      const topBlock = blocks[blocks.length - 1];
      const stackHeight = topBlock
        ? topBlock.position.y + topBlock.dimensions.y / 2
        : 0;
      vfxManager.onGameOver({ stackHeight });
      audioManager.play('gameover');
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
  }, [phase, blocks, vfxManager, audioManager]);

  // Unified placement detection - triggers on blocks.length increase
  // This handles both perfect and slice placements
  useEffect(() => {
    const newBlockCount = blocks.length;
    const prevBlockCount = prevBlockCountRef.current;
    const newPieceCount = fallingPieces.length;
    const prevPieceCount = prevFallingCountRef.current;

    // A new block was successfully placed
    const blockPlaced = newBlockCount > prevBlockCount && newBlockCount > 1;

    if (blockPlaced) {
      const topBlock = blocks[blocks.length - 1];

      if (topBlock) {
        // Check what type of placement this was
        const sliceOccurred = newPieceCount > prevPieceCount;

        if (lastPerfectHit) {
          // PERFECT PLACEMENT - no slice, full overlap
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

          // Play perfect sound
          audioManager.play('perfect');

          // Check for combo (streak >= 2)
          if (perfectStreak >= 2) {
            audioManager.play('combo', { multiplier: Math.min(perfectStreak, 4) });
          }
        } else if (sliceOccurred) {
          // SLICE PLACEMENT - partial overlap with overhang
          const newPiece = fallingPieces[fallingPieces.length - 1];

          if (newPiece) {
            // Determine which axis the cut was on
            const axis: 'x' | 'z' =
              Math.abs(newPiece.block.position.x - topBlock.position.x) > 0.01
                ? 'x'
                : 'z';

            // Calculate cut position
            const cutX =
              axis === 'x'
                ? (topBlock.position.x +
                    (topBlock.dimensions.x / 2) *
                      Math.sign(newPiece.block.position.x - topBlock.position.x) +
                    newPiece.block.position.x -
                    (newPiece.block.dimensions.x / 2) *
                      Math.sign(newPiece.block.position.x - topBlock.position.x)) /
                  2
                : topBlock.position.x;

            const cutZ =
              axis === 'z'
                ? (topBlock.position.z +
                    (topBlock.dimensions.z / 2) *
                      Math.sign(newPiece.block.position.z - topBlock.position.z) +
                    newPiece.block.position.z -
                    (newPiece.block.dimensions.z / 2) *
                      Math.sign(newPiece.block.position.z - topBlock.position.z)) /
                  2
                : topBlock.position.z;

            const cutLength =
              axis === 'x' ? topBlock.dimensions.z : topBlock.dimensions.x;
            const cutY = topBlock.position.y + topBlock.dimensions.y / 2;

            // Trigger slice VFX
            vfxManager.onSlice({
              cutPosition: new THREE.Vector3(cutX, cutY, cutZ),
              cutLength,
              axis,
              cutY,
            });

            // Play slice + place sounds together
            audioManager.play('place');
            audioManager.play('slice');
          }
        }
      }
    }

    // Update all refs
    prevBlockCountRef.current = newBlockCount;
    prevFallingCountRef.current = newPieceCount;
    prevLastPerfectRef.current = lastPerfectHit;
    prevPerfectStreakRef.current = perfectStreak;
  }, [blocks, fallingPieces, lastPerfectHit, perfectStreak, vfxManager, audioManager]);

  // Update VFX manager each frame
  useFrame((_, delta) => {
    if (initializedRef.current) {
      vfxManager.update(delta * 1000); // Convert to ms
    }
  });

  // This component renders nothing directly
  return null;
}
