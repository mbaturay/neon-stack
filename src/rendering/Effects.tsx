/**
 * Post-processing effects with variant-aware settings.
 */

import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useVisualStore } from '@/state/visualStore';

export function Effects() {
  const config = useVisualStore((state) => state.config);

  return (
    <EffectComposer>
      <Bloom
        intensity={config.bloomIntensity}
        luminanceThreshold={0.1}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <Vignette offset={0.3} darkness={0.7} />
    </EffectComposer>
  );
}
