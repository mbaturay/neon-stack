/**
 * Ground - Simple grid using drei Grid component with theme colors.
 */

import { Grid } from '@react-three/drei';
import { useSettingsStore } from '@/state/settingsStore';

export function Ground() {
  const theme = useSettingsStore((state) => state.theme);

  return (
    <Grid
      position={[0, -0.25, 0]}
      args={[50, 50]}
      cellSize={1}
      cellThickness={0.8}
      cellColor={theme.gridCell}
      sectionSize={5}
      sectionThickness={1.5}
      sectionColor={theme.gridSection}
      fadeDistance={40}
      fadeStrength={1}
      followCamera={false}
      infiniteGrid={false}
      side={2}
    />
  );
}
