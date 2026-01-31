/**
 * Production-quality input handling for desktop + mobile.
 *
 * Uses Pointer Events as the primary mechanism with de-duplication guards
 * to ensure exactly one drop per user intent.
 */

export interface InputConfig {
  /** Minimum time between drops in ms */
  debounceMs: number;
  /** Selector for elements that should NOT trigger drops (e.g., UI buttons) */
  ignoreSelector: string;
}

const DEFAULT_CONFIG: InputConfig = {
  debounceMs: 250,
  ignoreSelector: '[data-no-game-input]',
};

type DropCallback = () => void;
type VariantCallback = (variant: 'A' | 'B' | 'C') => void;
type EscapeCallback = () => void;

class InputManager {
  private callback: DropCallback | null = null;
  private variantCallback: VariantCallback | null = null;
  private escapeCallback: EscapeCallback | null = null;
  private config: InputConfig;
  private lastDropTime = 0;
  private activePointerIds = new Set<number>();
  private isInitialized = false;
  private inputDisabled = false;
  private boundHandlePointerDown: (e: PointerEvent) => void;
  private boundHandleKeyDown: (e: KeyboardEvent) => void;
  private boundPreventGhostClick: (e: MouseEvent) => void;

  constructor(config: Partial<InputConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.boundHandlePointerDown = this.handlePointerDown.bind(this);
    this.boundHandleKeyDown = this.handleKeyDown.bind(this);
    this.boundPreventGhostClick = this.preventGhostClick.bind(this);
  }

  /**
   * Disable game input (used when settings modal is open).
   */
  setInputDisabled(disabled: boolean): void {
    this.inputDisabled = disabled;
  }

  /**
   * Check if game input is currently disabled.
   */
  isInputDisabled(): boolean {
    return this.inputDisabled;
  }

  /**
   * Initialize input listeners on the document.
   * Call this once when the game mounts.
   */
  init(): void {
    if (this.isInitialized) return;

    // Pointer events - primary input mechanism
    document.addEventListener('pointerdown', this.boundHandlePointerDown, {
      passive: false,
      capture: true,
    });

    // Keyboard
    document.addEventListener('keydown', this.boundHandleKeyDown);

    // Prevent ghost clicks that some browsers fire after touch
    document.addEventListener('click', this.boundPreventGhostClick, {
      capture: true,
    });

    this.isInitialized = true;
  }

  /**
   * Clean up all listeners.
   */
  destroy(): void {
    if (!this.isInitialized) return;

    document.removeEventListener('pointerdown', this.boundHandlePointerDown, {
      capture: true,
    });
    document.removeEventListener('keydown', this.boundHandleKeyDown);
    document.removeEventListener('click', this.boundPreventGhostClick, {
      capture: true,
    });

    this.isInitialized = false;
    this.callback = null;
    this.activePointerIds.clear();
  }

  /**
   * Register the drop callback.
   */
  onDropRequested(callback: DropCallback): void {
    this.callback = callback;
  }

  /**
   * Register callback for visual variant switching (1/2/3 keys).
   */
  onVariantSwitch(callback: VariantCallback): void {
    this.variantCallback = callback;
  }

  /**
   * Register callback for Escape key (close settings).
   */
  onEscape(callback: EscapeCallback): void {
    this.escapeCallback = callback;
  }

  /**
   * Check if an element should be ignored (UI elements).
   */
  private shouldIgnoreTarget(target: EventTarget | null): boolean {
    if (!target || !(target instanceof Element)) return false;

    // Check if target or any ancestor matches the ignore selector
    return target.closest(this.config.ignoreSelector) !== null;
  }

  /**
   * Check if enough time has passed since last drop.
   */
  private isDebounced(): boolean {
    const now = performance.now();
    return now - this.lastDropTime < this.config.debounceMs;
  }

  /**
   * Trigger a drop if conditions are met.
   */
  private triggerDrop(): boolean {
    if (!this.callback) return false;
    if (this.isDebounced()) return false;

    this.lastDropTime = performance.now();
    this.callback();
    return true;
  }

  /**
   * Handle pointer down events (touch, mouse, pen).
   */
  private handlePointerDown(e: PointerEvent): void {
    // Ignore if game input is disabled (settings open)
    if (this.inputDisabled) return;

    // Ignore UI elements
    if (this.shouldIgnoreTarget(e.target)) return;

    // Check if this pointer already triggered (guards against duplicate events)
    if (this.activePointerIds.has(e.pointerId)) return;

    // Track this pointer
    this.activePointerIds.add(e.pointerId);

    // Clean up pointer tracking after a short delay
    setTimeout(() => {
      this.activePointerIds.delete(e.pointerId);
    }, this.config.debounceMs);

    // Only respond to primary button (left click / touch)
    if (e.button !== 0 && e.button !== -1) return;

    // Trigger drop
    if (this.triggerDrop()) {
      // Prevent any follow-up events
      e.preventDefault();
    }
  }

  /**
   * Handle keyboard input.
   */
  private handleKeyDown(e: KeyboardEvent): void {
    // Ignore if typing in an input field
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement
    ) {
      return;
    }

    // Escape key - always processed (for closing settings)
    if (e.code === 'Escape') {
      if (this.escapeCallback) {
        this.escapeCallback();
      }
      return;
    }

    // If input is disabled (settings open), block game controls
    if (this.inputDisabled) return;

    // Game controls
    if (e.code === 'Space' || e.code === 'Enter') {
      e.preventDefault();
      this.triggerDrop();
      return;
    }

    // Visual variant switching (1/2/3 keys)
    if (this.variantCallback) {
      if (e.code === 'Digit1' || e.code === 'Numpad1') {
        this.variantCallback('A');
      } else if (e.code === 'Digit2' || e.code === 'Numpad2') {
        this.variantCallback('B');
      } else if (e.code === 'Digit3' || e.code === 'Numpad3') {
        this.variantCallback('C');
      }
    }
  }

  /**
   * Prevent ghost clicks that fire after touch events.
   */
  private preventGhostClick(e: MouseEvent): void {
    // If we recently handled a pointer event, suppress this click
    if (this.isDebounced()) {
      e.preventDefault();
      e.stopPropagation();
    }
  }
}

// Singleton instance
export const inputManager = new InputManager();
