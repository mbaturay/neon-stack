import { useEffect } from 'react';
import { Scene } from './rendering/Scene';
import { HUD } from './ui/HUD';
import { ComboIndicator } from './ui/ComboIndicator';
import { SettingsModal } from './ui/SettingsModal';
import { initializeSettings } from './state/settingsStore';
import { useAndroidBackButton } from './hooks/useAndroidBackButton';
import { useNativeFeatures } from './hooks/useNativeFeatures';

export default function App() {
  // Initialize settings (apply persisted theme) on mount
  useEffect(() => {
    initializeSettings();
  }, []);

  // Handle Android back button and native features
  useAndroidBackButton();
  useNativeFeatures();

  return (
    <>
      <Scene />
      <HUD />
      <ComboIndicator />
      <SettingsModal />
    </>
  );
}
