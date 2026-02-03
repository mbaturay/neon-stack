/// <reference types="vite/client" />

/**
 * Juice Configuration
 * All tuning constants for motion/impact effects in one place.
 * Easy to tweak without hunting through multiple files.
 */

// Grid Parallax - opposing drift based on active block position
export const GRID_PARALLAX_MAX_OFFSET = 0.4;   // world units, max grid displacement - increased
export const GRID_PARALLAX_SPEED = 0.8;        // exponential smoothing factor
export const GRID_PARALLAX_FACTOR = 0.12;      // how much block position affects grid - increased

// Grid Idle Drift - subtle ambient motion
export const GRID_IDLE_DRIFT_AMPLITUDE = 0.1;  // world units - increased for visibility
export const GRID_IDLE_DRIFT_SPEED = 0.15;     // cycles per second

// Camera Shake - damped impulse for fighting-game impact feel
// Uses formula: offset = dir * amp * sin(omega*t) * exp(-damping*t)
// Each placement type has its own amplitude and duration
export const SHAKE_NORMAL_AMPLITUDE = 0.10;    // normal placement shake - BIG for visibility
export const SHAKE_NORMAL_DURATION_MS = 90;
export const SHAKE_SLICE_AMPLITUDE = 0.13;     // slice/sloppy placement shake
export const SHAKE_SLICE_DURATION_MS = 110;
export const SHAKE_PERFECT_AMPLITUDE = 0.18;   // perfect placement - huge arcade hit
export const SHAKE_PERFECT_DURATION_MS = 140;
export const SHAKE_FREQUENCY = 12;             // oscillation frequency in Hz (1-2 oscillations in duration)
export const SHAKE_DAMPING = 15;               // exponential decay rate (higher = faster settle)

// Hit-Stop - freeze frames on impact (arcade style)
export const HITSTOP_NORMAL_MS = 40;           // normal placement freeze
export const HITSTOP_SLICE_MS = 55;            // slice placement freeze
export const HITSTOP_PERFECT_MS = 110;         // perfect placement - longer freeze for impact

// Grid Pulse - visual feedback flash on placement
export const PULSE_DURATION_MS = 200;          // how long pulse lasts
export const PULSE_BASE = 0.15;                // base pulse intensity (additive to opacity) - increased
export const PULSE_SLOPPY_MULT = 1.2;          // multiplier for sloppy placements
export const PULSE_PERFECT_MULT = 2.0;         // multiplier for perfect placements (cleaner feel)
export const PULSE_DECAY_EXPONENT = 3.0;       // exponential decay rate - slower decay for visibility

// Reduced Motion Factors - scale down effects for accessibility
export const REDUCED_MOTION_PARALLAX_SCALE = 0.0;  // 0 = disabled
export const REDUCED_MOTION_DRIFT_SCALE = 0.0;     // 0 = disabled
export const REDUCED_MOTION_SHAKE_SCALE = 0.0;     // 0 = disabled
export const REDUCED_MOTION_PULSE_SCALE = 0.3;     // keep subtle pulse feedback

// Debug flag - logs triggers in dev mode
export const JUICE_DEBUG = import.meta.env.DEV && true; // Set to true for dev testing
