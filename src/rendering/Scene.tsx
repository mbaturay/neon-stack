/**
 * Main Three.js scene with R3F Canvas.
 */

import { Canvas } from '@react-three/fiber';
import { BlockStack } from './BlockStack';
import { MovingBlock } from './MovingBlock';
import { FallingPieces } from './FallingPieces';
import { CameraRig } from './CameraRig';
import { GameController } from './GameController';
import { Effects } from './Effects';
import { Ground } from './Ground';
import { VFXController } from './VFXController';
import { useInput } from '@/hooks/useInput';

function SceneContent() {
  return (
    <>
      <color attach="background" args={['#0a0a0f']} />

      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 20, 10]} intensity={1} />
      <pointLight position={[-10, 10, -10]} intensity={0.5} color="#00ffff" />

      {/* Environment */}
      <Ground />

      {/* Game elements */}
      <BlockStack />
      <MovingBlock />
      <FallingPieces />

      {/* VFX System */}
      <VFXController />

      {/* Controllers */}
      <CameraRig />
      <GameController />

      {/* Post-processing */}
      <Effects />
    </>
  );
}

export function Scene() {
  // Initialize centralized input handling
  useInput();

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [15, 8, 15], fov: 45 }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        touchAction: 'manipulation',
      }}
    >
      <SceneContent />
    </Canvas>
  );
}
