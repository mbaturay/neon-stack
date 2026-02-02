/**
 * MusicManager - Background music system with shuffle bag playback
 *
 * Features:
 * - No-repeat shuffle bag algorithm for track rotation
 * - HTMLAudioElement + WebAudio GainNode for volume/fades
 * - Mobile-safe: requires unlock() on first user gesture
 * - Smooth fade in/out transitions
 */

/**
 * Debug flag - set to true to log music events.
 */
const MUSIC_DEBUG = import.meta.env.DEV && true;

/**
 * Track URLs (files in public/music/)
 */
const TRACK_URLS = [
  '/music/NS-1.mp3',
  '/music/NS-2.mp3',
  '/music/NS-3.mp3',
  '/music/NS-4.mp3',
  '/music/NS-5.mp3',
  '/music/NS-6.mp3',
  '/music/NS-7.mp3',
];

import { getAudioManager } from './AudioManager';

/**
 * Fade durations in seconds
 */
const FADE_IN_DURATION = 0.25;
const FADE_OUT_DURATION = 0.35;
const MAX_MUSIC_GAIN = 0.2;

function debugLog(message: string, ...args: unknown[]): void {
  if (MUSIC_DEBUG) {
    console.log(`[MUSIC] ${message}`, ...args);
  }
}

/**
 * Fisher-Yates shuffle algorithm (in-place)
 */
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j] as T;
    array[j] = temp as T;
  }
  return array;
}

class MusicManagerImpl {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private mediaSource: MediaElementAudioSourceNode | null = null;
  private ownsAudioContext: boolean = false;

  private shuffleBag: number[] = [];
  private lastPlayedIndex: number = -1;
  private targetVolume: number = 0.8;
  private isPlaying: boolean = false;
  private isUnlocked: boolean = false;
  private isInitialized: boolean = false;
  private pendingStart: boolean = false;

  // Track unique errors to avoid spam
  private loggedErrors: Set<string> = new Set();

  /**
   * Initialize internal state. Safe to call multiple times.
   */
  init(): void {
    if (this.isInitialized) return;

    // Create audio element
    this.audioElement = new Audio();
    this.audioElement.loop = true;
    this.audioElement.preload = 'auto';

    // Safari/iOS friendliness
    // (TypeScript doesn't type playsInline on HTMLAudioElement)
    (this.audioElement as unknown as { playsInline?: boolean }).playsInline = true;
    this.audioElement.crossOrigin = 'anonymous';

    // Handle playback errors
    this.audioElement.addEventListener('error', (e) => {
      const errorKey = `audio-error-${this.audioElement?.src}`;
      if (!this.loggedErrors.has(errorKey)) {
        this.loggedErrors.add(errorKey);
        console.warn('[MUSIC] Audio playback error:', e);
      }
    });

    // Refill shuffle bag
    this.refillShuffleBag();

    this.isInitialized = true;
    debugLog('Initialized');
  }

  /**
   * Unlock audio playback on first user gesture.
   * Required for mobile Safari/iOS.
   */
  async unlock(): Promise<void> {
    if (this.isUnlocked) {
      debugLog('Already unlocked');
      return;
    }

    // Ensure init was called
    this.init();

    debugLog('Starting unlock...');

    try {
      // Prefer sharing AudioManager's AudioContext to avoid Safari/macOS issues
      const audioManager = getAudioManager();
      await audioManager.initFromUserGesture();

      const sharedContext = audioManager.getWebAudioContext();
      const sharedMaster = audioManager.getMasterGainNode();

      if (sharedContext && sharedMaster) {
        this.audioContext = sharedContext;
        this.ownsAudioContext = false;
        debugLog('Using shared AudioContext from AudioManager', { state: this.audioContext.state });
      } else {
        debugLog('Falling back to dedicated AudioContext...');
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.ownsAudioContext = true;
        debugLog('Dedicated AudioContext created', { state: this.audioContext.state });
      }

      // Resume if suspended
      if (this.audioContext.state === 'suspended') {
        debugLog('Resuming suspended AudioContext...');
        await this.audioContext.resume();
        debugLog('AudioContext resumed', { state: this.audioContext.state });
      }

      // Create gain node for volume control (connect to shared master bus if available)
      debugLog('Creating GainNode...');
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = this.targetVolume;

      if (sharedContext && sharedMaster && this.audioContext === sharedContext) {
        this.gainNode.connect(sharedMaster);
      } else {
        this.gainNode.connect(this.audioContext.destination);
      }

      debugLog('GainNode connected');

      // Connect audio element to WebAudio
      if (this.audioElement) {
        debugLog('Connecting audio element to WebAudio...');
        this.mediaSource = this.audioContext.createMediaElementSource(this.audioElement);
        this.mediaSource.connect(this.gainNode);
        debugLog('Audio element connected');
      }

      // Try to play/pause to fully unlock on iOS (only if we have a source)
      // Note: play() on empty Audio element hangs, so we load a track first
      if (this.audioElement) {
        debugLog('Performing iOS unlock workaround...');
        const firstTrack = TRACK_URLS[0];
        if (firstTrack) {
          this.audioElement.src = firstTrack;
          this.audioElement.muted = true;
          this.audioElement.volume = 0;
          try {
            const playPromise = this.audioElement.play();
            // Add timeout to prevent hanging
            const timeoutPromise = new Promise<void>((_, reject) =>
              setTimeout(() => reject(new Error('Play timeout')), 500)
            );
            await Promise.race([playPromise, timeoutPromise]);
            this.audioElement.pause();
            this.audioElement.currentTime = 0;
            debugLog('iOS unlock workaround completed');
          } catch (playErr) {
            debugLog('iOS unlock play skipped:', playErr);
          }
          this.audioElement.muted = false;
          this.audioElement.volume = 1;
        }
      }

      this.isUnlocked = true;
      debugLog('Unlocked successfully', { contextState: this.audioContext.state });

      // If startLoop was called before unlock completed, start now
      if (this.pendingStart) {
        this.pendingStart = false;
        debugLog('Starting pending playback');
        this.startLoop();
      }
    } catch (err) {
      console.warn('[MUSIC] Failed to unlock audio:', err);
    }
  }

  /**
   * Refill and shuffle the track bag.
   * Ensures first pick of new bag isn't same as last played.
   */
  private refillShuffleBag(): void {
    // Create array of indices [0, 1, 2, ..., n-1]
    this.shuffleBag = Array.from({ length: TRACK_URLS.length }, (_, i) => i);
    shuffleArray(this.shuffleBag);

    // If the first track in new bag is same as last played, swap it
    if (this.shuffleBag.length > 1 && this.shuffleBag[this.shuffleBag.length - 1] === this.lastPlayedIndex) {
      // Swap with a random position that's not the last
      const lastIdx = this.shuffleBag.length - 1;
      const swapIdx = Math.floor(Math.random() * (this.shuffleBag.length - 1));
      const temp = this.shuffleBag[lastIdx];
      this.shuffleBag[lastIdx] = this.shuffleBag[swapIdx] as number;
      this.shuffleBag[swapIdx] = temp as number;
    }

    debugLog('Shuffle bag refilled', this.shuffleBag.map(i => `NS-${i + 1}`));
  }

  /**
   * Get the next track index from the shuffle bag.
   */
  private getNextTrackIndex(): number {
    if (this.shuffleBag.length === 0) {
      this.refillShuffleBag();
    }
    const index = this.shuffleBag.pop()!;
    this.lastPlayedIndex = index;
    return index;
  }

  /**
   * Start playing the next track from the shuffle bag.
   */
  async startLoop(): Promise<void> {
    if (!this.isUnlocked || !this.audioElement || !this.gainNode || !this.audioContext) {
      debugLog('startLoop called but not unlocked yet - queuing');
      this.pendingStart = true;
      return;
    }

    // If volume is 0, don't start
    if (this.targetVolume <= 0) {
      debugLog('startLoop skipped - volume is 0');
      return;
    }

    // If already playing, don't restart
    if (this.isPlaying) {
      debugLog('startLoop skipped - already playing');
      return;
    }

    const trackIndex = this.getNextTrackIndex();
    const trackUrl = TRACK_URLS[trackIndex]!;
    const trackName = `NS-${trackIndex + 1}`;

    debugLog(`Starting track: ${trackName}`, trackUrl);

    try {
      // Set source
      this.audioElement.src = trackUrl;
      this.audioElement.load();
      this.audioElement.currentTime = 0;

      // Fade in: start at 0, ramp to target
      const now = this.audioContext.currentTime;
      this.gainNode.gain.cancelScheduledValues(now);
      this.gainNode.gain.setValueAtTime(0, now);
      this.gainNode.gain.linearRampToValueAtTime(this.targetVolume, now + FADE_IN_DURATION);

      // Start playback
      await this.audioElement.play();
      this.isPlaying = true;

      debugLog(`Playing: ${trackName}`);
    } catch (err) {
      const errorKey = `play-error-${trackUrl}`;
      if (!this.loggedErrors.has(errorKey)) {
        this.loggedErrors.add(errorKey);
        console.warn('[MUSIC] Failed to start playback:', err);
      }
    }
  }

  /**
   * Fade out and stop playback.
   */
  stop(): void {
    // Clear pending start if called before unlock completed
    this.pendingStart = false;

    if (!this.isPlaying || !this.audioElement || !this.gainNode || !this.audioContext) {
      return;
    }

    debugLog('Stopping with fade out');

    const now = this.audioContext.currentTime;

    // Fade out
    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
    this.gainNode.gain.linearRampToValueAtTime(0, now + FADE_OUT_DURATION);

    // Stop after fade completes
    setTimeout(() => {
      if (this.audioElement && !this.isPlaying) {
        // Only pause if we haven't started again
        return;
      }
      if (this.audioElement) {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
      }
      this.isPlaying = false;
      debugLog('Stopped');
    }, FADE_OUT_DURATION * 1000 + 50);

    this.isPlaying = false;
  }

  /**
   * Set music volume (UI 0-100).
   * If volume becomes 0, fade out and stop.
   */
  setVolume(uiVolume: number): void {
    const uiClamped = Math.max(0, Math.min(100, uiVolume <= 1 ? uiVolume * 100 : uiVolume));
    const normalized = uiClamped / 100;
    const targetGain = normalized * MAX_MUSIC_GAIN;
    this.targetVolume = targetGain;

    debugLog(`uiVolume=${Math.round(uiClamped)}% -> gain=${targetGain.toFixed(3)}`);

    if (!this.gainNode || !this.audioContext) {
      return;
    }

    if (targetGain <= 0) {
      // Fade out and stop
      if (this.isPlaying) {
        this.stop();
      }
      return;
    }

    // Apply volume change with short fade
    const now = this.audioContext.currentTime;
    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
    this.gainNode.gain.linearRampToValueAtTime(targetGain, now + 0.1);
  }

  /**
   * Check if music is currently playing.
   */
  get playing(): boolean {
    return this.isPlaying;
  }

  /**
   * Check if audio is unlocked.
   */
  get unlocked(): boolean {
    return this.isUnlocked;
  }

  /**
   * Clean up resources.
   */
  dispose(): void {
    this.stop();

    if (this.mediaSource) {
      this.mediaSource.disconnect();
      this.mediaSource = null;
    }

    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }

    if (this.audioContext) {
      if (this.ownsAudioContext) {
        this.audioContext.close();
      }
      this.audioContext = null;
    }

    if (this.audioElement) {
      this.audioElement.src = '';
      this.audioElement = null;
    }

    this.isInitialized = false;
    this.isUnlocked = false;
    this.isPlaying = false;
    this.ownsAudioContext = false;

    debugLog('Disposed');
  }
}

// Singleton instance
let instance: MusicManagerImpl | null = null;

/**
 * Get the MusicManager singleton instance.
 */
export function getMusicManager(): MusicManagerImpl {
  if (!instance) {
    instance = new MusicManagerImpl();
  }
  return instance;
}

/**
 * Reset the MusicManager (for testing or hot reload).
 */
export function resetMusicManager(): void {
  if (instance) {
    instance.dispose();
    instance = null;
  }
}
