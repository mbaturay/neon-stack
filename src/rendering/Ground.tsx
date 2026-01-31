/**
 * Ground - Simple grid using drei Grid component.
 */

import { Grid } from '@react-three/drei';

export function Ground() {
  return (
    <Grid
      position={[0, -0.25, 0]}
      args={[50, 50]}
      cellSize={1}
      cellThickness={0.8}
      cellColor="#005566"
      sectionSize={5}
      sectionThickness={1.5}
      sectionColor="#00aacc"
      fadeDistance={40}
      fadeStrength={1}
      followCamera={false}
      infiniteGrid={false}
      side={2}
    />
  );
}
