import { useEffect } from 'react';
import { Scene } from './rendering/Scene';
import { HUD } from './ui/HUD';
import { ComboIndicator } from './ui/ComboIndicator';
import { SettingsModal } from './ui/SettingsModal';
import { initializeSettings } from './state/settingsStore';

export default function App() {
  // Initialize settings (apply persisted theme) on mount
  useEffect(() => {
    initializeSettings();
  }, []);

  return (
    <>
      <Scene />
      <HUD />
      <ComboIndicator />
      <SettingsModal />
    </>
  );
}
