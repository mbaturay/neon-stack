/**
 * Settings modal overlay with glassmorphism styling.
 * Visible only on launch and game over states.
 */

import { useEffect } from 'react';
import { useGameStore } from '@/state/gameStore';
import { useSettingsStore } from '@/state/settingsStore';
import { useVisualStore } from '@/state/visualStore';
import { inputManager } from '@/game/Input';
import { VARIANTS, type VisualVariant } from '@/rendering/VisualStyle';
import type { ThemeColor } from '@/game/Theme';
import styles from './styles/Settings.module.css';

function GearIcon() {
  return (
    <svg
      className={styles['settingsIcon']}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

function VolumeSlider({ label, value, onChange }: SliderProps) {
  const displayValue = value === 0 ? 'Muted' : `${value}%`;

  return (
    <div className={styles['sliderContainer']}>
      <div className={styles['sliderHeader']}>
        <span className={styles['sliderLabel']}>{label}</span>
        <span className={styles['sliderValue']}>{displayValue}</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={styles['slider']}
        data-no-game-input
      />
    </div>
  );
}

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <div className={styles['toggleContainer']}>
      <span className={styles['toggleLabel']}>{label}</span>
      <button
        className={`${styles['toggle']} ${checked ? styles['active'] : ''}`}
        onPointerDown={(e) => {
          e.stopPropagation();
          onChange(!checked);
        }}
        data-no-game-input
      />
    </div>
  );
}

function SettingsPanel() {
  const {
    visualVariant,
    themeColor,
    musicVolume,
    sfxVolume,
    reducedMotion,
    setVisualVariant,
    setThemeColor,
    setMusicVolume,
    setSfxVolume,
    setReducedMotion,
    closeSettings,
    resetToDefaults,
  } = useSettingsStore();

  const setVariant = useVisualStore((state) => state.setVariant);

  const handleVariantChange = (variant: VisualVariant) => {
    setVisualVariant(variant);
    setVariant(variant);
  };

  const handleOverlayClick = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (e.target === e.currentTarget) {
      closeSettings();
    }
  };

  const handleModalClick = (e: React.PointerEvent) => {
    e.stopPropagation();
  };

  const styleOptions: { value: VisualVariant; label: string; description: string }[] = [
    { value: 'A', label: VARIANTS.A.name, description: VARIANTS.A.description },
    { value: 'B', label: VARIANTS.B.name, description: VARIANTS.B.description },
    { value: 'C', label: VARIANTS.C.name, description: VARIANTS.C.description },
  ];

  const themeOptions: { value: ThemeColor; className: string }[] = [
    { value: 'cyan', className: styles['colorCyan'] ?? '' },
    { value: 'magenta', className: styles['colorMagenta'] ?? '' },
    { value: 'green', className: styles['colorGreen'] ?? '' },
    { value: 'orange', className: styles['colorOrange'] ?? '' },
    { value: 'purple', className: styles['colorPurple'] ?? '' },
  ];

  return (
    <div
      className={styles['overlay']}
      onPointerDown={handleOverlayClick}
      data-no-game-input
    >
      <div
        className={styles['modal']}
        onPointerDown={handleModalClick}
        data-no-game-input
      >
        <div className={styles['header']}>
          <h2 className={styles['title']}>SETTINGS</h2>
          <button
            className={styles['closeButton']}
            onPointerDown={(e) => {
              e.stopPropagation();
              closeSettings();
            }}
            data-no-game-input
          >
            <CloseIcon />
          </button>
        </div>

        {/* Visual Style */}
        <div className={styles['section']}>
          <div className={styles['sectionTitle']}>Visual Style</div>
          <div className={styles['styleOptionGroup']}>
            {styleOptions.map((option) => (
              <button
                key={option.value}
                className={`${styles['styleOption']} ${
                  visualVariant === option.value ? styles['active'] : ''
                }`}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  handleVariantChange(option.value);
                }}
                data-no-game-input
              >
                <span className={styles['styleLabel']}>{option.label}</span>
                <span className={styles['styleDescription']}>{option.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Theme Color */}
        <div className={styles['section']}>
          <div className={styles['sectionTitle']}>Theme Color</div>
          <div className={styles['optionGroup']}>
            {themeOptions.map((option) => (
              <button
                key={option.value}
                className={`${styles['colorButton']} ${option.className} ${
                  themeColor === option.value ? styles['active'] : ''
                }`}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setThemeColor(option.value);
                }}
                data-no-game-input
              />
            ))}
          </div>
        </div>

        {/* Audio */}
        <div className={styles['section']}>
          <div className={styles['sectionTitle']}>Audio</div>
          <VolumeSlider
            label="Music"
            value={musicVolume}
            onChange={setMusicVolume}
          />
          <VolumeSlider
            label="Sound Effects"
            value={sfxVolume}
            onChange={setSfxVolume}
          />
        </div>

        {/* Accessibility */}
        <div className={styles['section']}>
          <div className={styles['sectionTitle']}>Accessibility</div>
          <Toggle
            label="Reduced Motion"
            checked={reducedMotion}
            onChange={setReducedMotion}
          />
        </div>

        {/* Reset */}
        <button
          className={styles['resetButton']}
          onPointerDown={(e) => {
            e.stopPropagation();
            resetToDefaults();
            setVariant('A');
          }}
          data-no-game-input
        >
          RESET TO DEFAULTS
        </button>
      </div>
    </div>
  );
}

export function SettingsButton() {
  const phase = useGameStore((state) => state.phase);
  const { isSettingsOpen, openSettings } = useSettingsStore();

  // Only show settings button on launch or gameover, not during playing
  const showButton = phase !== 'playing';

  if (!showButton || isSettingsOpen) return null;

  return (
    <button
      className={styles['settingsButton']}
      onPointerDown={(e) => {
        e.stopPropagation();
        openSettings();
      }}
      data-no-game-input
    >
      <GearIcon />
    </button>
  );
}

export function SettingsModal() {
  const { isSettingsOpen, closeSettings } = useSettingsStore();

  // Disable game input when settings is open
  useEffect(() => {
    inputManager.setInputDisabled(isSettingsOpen);
    return () => {
      inputManager.setInputDisabled(false);
    };
  }, [isSettingsOpen]);

  // Handle escape key
  useEffect(() => {
    inputManager.onEscape(() => {
      if (isSettingsOpen) {
        closeSettings();
      }
    });
  }, [isSettingsOpen, closeSettings]);

  if (!isSettingsOpen) return null;

  return <SettingsPanel />;
}
