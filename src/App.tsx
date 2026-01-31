import { Scene } from './rendering/Scene';
import { HUD } from './ui/HUD';
import { ComboIndicator } from './ui/ComboIndicator';
import { StyleSwitcher } from './ui/StyleSwitcher';

export default function App() {
  return (
    <>
      <Scene />
      <HUD />
      <ComboIndicator />
      <StyleSwitcher />
    </>
  );
}
