/**
 * AudioManager - Web Audio API based audio system
 *
 * Features:
 * - Lazy AudioContext initialization on first user gesture
 * - Procedural SFX synthesis (no external assets)
 * - Separate music and SFX volume controls
 * - Perceptual volume curve for natural loudness
 * - Debug logging for development
 */

export type SFXName = 'perfect' | 'slice' | 'place' | 'gameover' | 'ui' | 'combo';

export interface PlayOptions {
  /** Multiplier for combo sounds (2, 3, 4+) */
  multiplier?: number;
}

/**
 * Debug flag - set to true to log all audio events.
 * Disabled in production builds.
 */
const AUDIO_DEBUG = import.meta.env.DEV && true;

/**
 * Per-sound gain levels for tuning.
 * Adjust these to balance sound volumes relative to each other.
 */
const GAIN_LEVELS = {
  perfect: 0.30,
  slice: 0.50,      // Increased from 0.25 for audibility
  place: 0.40,
  gameover: 0.35,
  ui: 0.18,
  combo: 0.35,
} as const;

function debugLog(message: string, ...args: unknown[]): void {
  if (AUDIO_DEBUG) {
    console.log(`[AUDIO] ${message}`, ...args);
  }
}

/**
 * Convert linear volume (0-100) to perceptual gain using power curve.
 * Human hearing is logarithmic, so we use x^2 for more natural control.
 */
function volumeToGain(volume: number): number {
  const normalized = Math.max(0, Math.min(100, volume)) / 100;
  return normalized * normalized; // Quadratic curve
}

class AudioManagerImpl {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;

  private musicSource: AudioBufferSourceNode | null = null;
  private initialized = false;
  private unlockAttempted = false;

  // Volume state (persisted via settingsStore)
  private _musicVolume = 80;
  private _sfxVolume = 80;

  /**
   * Initialize AudioContext on first user gesture.
   * Must be called from a user interaction event handler.
   */
  async initFromUserGesture(): Promise<void> {
    if (this.initialized || this.unlockAttempted) return;
    this.unlockAttempted = true;

    debugLog('Initializing AudioContext from user gesture...');

    try {
      // Create AudioContext
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Resume if suspended (required by some browsers)
      if (this.context.state === 'suspended') {
        await this.context.resume();
        debugLog('AudioContext resumed from suspended state');
      }

      // Create gain node hierarchy: source -> sfx/music -> master -> destination
      this.masterGain = this.context.createGain();
      this.masterGain.connect(this.context.destination);
      this.masterGain.gain.value = 1.0;

      this.sfxGain = this.context.createGain();
      this.sfxGain.connect(this.masterGain);
      this.sfxGain.gain.value = volumeToGain(this._sfxVolume);

      this.musicGain = this.context.createGain();
      this.musicGain.connect(this.masterGain);
      this.musicGain.gain.value = volumeToGain(this._musicVolume);

      this.initialized = true;
      debugLog('AudioContext initialized successfully', {
        sampleRate: this.context.sampleRate,
        state: this.context.state,
      });
    } catch (err) {
      console.warn('AudioManager: Failed to initialize AudioContext', err);
    }
  }

  /**
   * Check if audio system is ready.
   */
  get isReady(): boolean {
    return this.initialized && this.context !== null;
  }

  /**
   * Internal routing access for systems that want to share this AudioContext.
   * (Used by MusicManager to avoid creating a second AudioContext on Safari.)
   */
  getWebAudioContext(): AudioContext | null {
    return this.context;
  }

  /**
   * Internal routing access for systems that want to connect into the master bus.
   */
  getMasterGainNode(): GainNode | null {
    return this.masterGain;
  }

  /**
   * Set SFX volume (0-100).
   */
  setSfxVolume(volume: number): void {
    this._sfxVolume = volume;
    if (this.sfxGain && this.context) {
      this.sfxGain.gain.setValueAtTime(
        volumeToGain(volume),
        this.context.currentTime
      );
    }
    debugLog('SFX volume set to', volume);
  }

  /**
   * Set music volume (0-100).
   */
  setMusicVolume(volume: number): void {
    this._musicVolume = volume;
    if (this.musicGain && this.context) {
      this.musicGain.gain.setValueAtTime(
        volumeToGain(volume),
        this.context.currentTime
      );
    }
    debugLog('Music volume set to', volume);
  }

  /**
   * Play a sound effect by name.
   */
  play(name: SFXName, options?: PlayOptions): void {
    if (!this.isReady || !this.context || !this.sfxGain) {
      debugLog(`play(${name}) - SKIPPED: AudioContext not ready`);
      return;
    }
    if (this._sfxVolume === 0) {
      debugLog(`play(${name}) - SKIPPED: volume is 0`);
      return;
    }

    debugLog(`play(${name})`, options || '');

    switch (name) {
      case 'perfect':
        this.playPerfect();
        break;
      case 'slice':
        this.playSlice();
        break;
      case 'place':
        this.playPlace();
        break;
      case 'gameover':
        this.playGameOver();
        break;
      case 'ui':
        this.playUI();
        break;
      case 'combo':
        this.playCombo(options?.multiplier ?? 2);
        break;
    }
  }

  /**
   * Perfect hit: Bright ping with upward pitch bend
   */
  private playPerfect(): void {
    const ctx = this.context!;
    const now = ctx.currentTime;
    const baseGain = GAIN_LEVELS.perfect;

    // Create oscillator - triangle wave for brightness
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, now); // A5
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.05); // Up to E6

    // Envelope
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(baseGain, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    // Add subtle harmonic
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1760, now); // A6
    osc2.frequency.exponentialRampToValueAtTime(2640, now + 0.05);

    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(baseGain * 0.5, now);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    // Connect
    osc.connect(gain);
    osc2.connect(gain2);
    gain.connect(this.sfxGain!);
    gain2.connect(this.sfxGain!);

    // Play
    osc.start(now);
    osc2.start(now);
    osc.stop(now + 0.15);
    osc2.stop(now + 0.1);

    // Cleanup
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
    osc2.onended = () => {
      osc2.disconnect();
      gain2.disconnect();
    };
  }

  /**
   * Slice: Crisp noise burst with transient click - IMPROVED for audibility
   */
  private playSlice(): void {
    const ctx = this.context!;
    const now = ctx.currentTime;
    const baseGain = GAIN_LEVELS.slice;

    // Create noise buffer (30ms for tighter sound)
    const bufferSize = Math.floor(ctx.sampleRate * 0.03);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Bandpass filter for focused "slice" character (lowered from 2000Hz)
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1500, now);
    filter.Q.value = 2;

    // Envelope - very fast attack and decay
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(baseGain, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.025);

    // Add transient click oscillator for attack clarity
    const click = ctx.createOscillator();
    click.type = 'square';
    click.frequency.setValueAtTime(3000, now);
    click.frequency.exponentialRampToValueAtTime(800, now + 0.008);

    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(baseGain * 0.6, now);
    clickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.012);

    // Connect noise path
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain!);

    // Connect click path
    click.connect(clickGain);
    clickGain.connect(this.sfxGain!);

    // Play
    noise.start(now);
    click.start(now);
    noise.stop(now + 0.03);
    click.stop(now + 0.015);

    // Cleanup
    noise.onended = () => {
      noise.disconnect();
      filter.disconnect();
      noiseGain.disconnect();
    };
    click.onended = () => {
      click.disconnect();
      clickGain.disconnect();
    };
  }

  /**
   * Place: Low thump with pitch drop
   */
  private playPlace(): void {
    const ctx = this.context!;
    const now = ctx.currentTime;
    const baseGain = GAIN_LEVELS.place;

    // Low sine oscillator
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.1);

    // Envelope
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(baseGain, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    // Add subtle click attack
    const click = ctx.createOscillator();
    click.type = 'square';
    click.frequency.setValueAtTime(200, now);

    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(baseGain * 0.25, now);
    clickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.02);

    // Connect
    osc.connect(gain);
    click.connect(clickGain);
    gain.connect(this.sfxGain!);
    clickGain.connect(this.sfxGain!);

    // Play
    osc.start(now);
    click.start(now);
    osc.stop(now + 0.12);
    click.stop(now + 0.02);

    // Cleanup
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
    click.onended = () => {
      click.disconnect();
      clickGain.disconnect();
    };
  }

  /**
   * Combo: Bright ascending ping based on multiplier
   * Higher multiplier = higher pitch
   */
  private playCombo(multiplier: number): void {
    const ctx = this.context!;
    const now = ctx.currentTime;
    const baseGain = GAIN_LEVELS.combo;

    // Pitch increases with multiplier: 2x=A5, 3x=C#6, 4+=E6
    const pitchMultiplier = Math.min(multiplier, 4);
    const baseFreq = 880 * Math.pow(1.26, pitchMultiplier - 2); // ~major third per step

    // Main oscillator - sine for purity
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.08);

    // Envelope - quick bright ping
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(baseGain, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    // Harmonic overtone
    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(baseFreq * 2, now);
    osc2.frequency.exponentialRampToValueAtTime(baseFreq * 3, now + 0.06);

    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(baseGain * 0.4, now);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    // Connect
    osc.connect(gain);
    osc2.connect(gain2);
    gain.connect(this.sfxGain!);
    gain2.connect(this.sfxGain!);

    // Play
    osc.start(now);
    osc2.start(now);
    osc.stop(now + 0.12);
    osc2.stop(now + 0.08);

    // Cleanup
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
    osc2.onended = () => {
      osc2.disconnect();
      gain2.disconnect();
    };

    debugLog(`Combo sound played with multiplier ${multiplier}, freq ${baseFreq.toFixed(0)}Hz`);
  }

  /**
   * Game Over: Low down-sweep with longer decay
   */
  private playGameOver(): void {
    const ctx = this.context!;
    const now = ctx.currentTime;
    const baseGain = GAIN_LEVELS.gameover;

    // Main low sweep
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now); // A3
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.8); // Down to A1

    // Envelope - longer decay
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(baseGain, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

    // Add dissonant layer
    const osc2 = ctx.createOscillator();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(185, now); // Slightly off for dissonance
    osc2.frequency.exponentialRampToValueAtTime(46, now + 0.8);

    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(baseGain * 0.3, now);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

    // Lowpass filter to soften
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.8);

    // Connect
    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain!);

    // Play
    osc.start(now);
    osc2.start(now);
    osc.stop(now + 0.8);
    osc2.stop(now + 0.8);

    // Cleanup
    osc.onended = () => {
      osc.disconnect();
      osc2.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
  }

  /**
   * UI: Tiny soft click
   */
  private playUI(): void {
    const ctx = this.context!;
    const now = ctx.currentTime;
    const baseGain = GAIN_LEVELS.ui;

    // Very short sine blip
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.03);

    // Very fast envelope
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(baseGain, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);

    // Connect
    osc.connect(gain);
    gain.connect(this.sfxGain!);

    // Play
    osc.start(now);
    osc.stop(now + 0.03);

    // Cleanup
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }

  /**
   * Start music loop (placeholder for future use).
   * @param url Optional URL to music file
   */
  async startMusicLoop(url?: string): Promise<void> {
    if (!this.isReady || !this.context || !this.musicGain) return;

    // Stop any existing music
    this.stopMusic();

    if (!url) {
      debugLog('No music URL provided');
      return;
    }

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.context.decodeAudioData(arrayBuffer);

      this.musicSource = this.context.createBufferSource();
      this.musicSource.buffer = audioBuffer;
      this.musicSource.loop = true;
      this.musicSource.connect(this.musicGain);
      this.musicSource.start();
      debugLog('Music loop started');
    } catch (err) {
      console.warn('AudioManager: Failed to load music', err);
    }
  }

  /**
   * Stop music playback.
   */
  stopMusic(): void {
    if (this.musicSource) {
      try {
        this.musicSource.stop();
      } catch {
        // Already stopped
      }
      this.musicSource.disconnect();
      this.musicSource = null;
      debugLog('Music stopped');
    }
  }

  /**
   * Clean up resources.
   */
  dispose(): void {
    this.stopMusic();
    if (this.context) {
      this.context.close();
      this.context = null;
    }
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;
    this.initialized = false;
    this.unlockAttempted = false;
    debugLog('AudioManager disposed');
  }
}

// Singleton instance
let instance: AudioManagerImpl | null = null;

/**
 * Get the AudioManager singleton instance.
 */
export function getAudioManager(): AudioManagerImpl {
  if (!instance) {
    instance = new AudioManagerImpl();
  }
  return instance;
}

/**
 * Reset the AudioManager (for testing or hot reload).
 */
export function resetAudioManager(): void {
  if (instance) {
    instance.dispose();
    instance = null;
  }
}
