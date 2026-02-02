# Neon Stack

A Tron-inspired block stacking game with arcade-style juice effects. Built with React, Three.js, and TypeScript.

```
***************************
** Murat Baturay (c)2025 **
***************************
```

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 (or use your LAN IP for mobile testing).

## How to Play

**Goal:** Stack blocks as high as you can without missing.

### Controls

| Input | Action |
|-------|--------|
| **Space / Enter** | Start game or drop block |
| **Click / Tap** | Start game or drop block |
| **Esc** | Open settings |

### Gameplay

1. **Start** the game with Space, Enter, Click, or Tap
2. Watch the moving block slide back and forth
3. **Drop** at the right moment to land on the stack
4. Any part that overhangs gets **sliced off** (making the next block smaller)
5. Keep landing blocks to build **combo multipliers** and increase your score

### Scoring

| Placement | Points | Effect |
|-----------|--------|--------|
| **Perfect** | Base + Combo Bonus | Block size preserved, streak continues |
| **Slice** | Base points | Overhang falls, block shrinks |
| **Miss** | Game Over | Better luck next time! |

- **Combo multipliers** build with consecutive perfect hits (2x, 4x, 8x...)
- The smaller your block gets, the harder perfect hits become

### Tips

- Focus on the **leading edge** of the moving block
- Early in the run, prioritize **perfect hits** to keep the block large
- If the block gets tiny, aim for **safe center landings** to stabilize
- Watch for the **glow flash** on perfect landings

## Features

### Visual Styles

The game includes multiple visual styles accessible from Settings:

- **Style A** - Classic neon aesthetic with bloom and glow
- **Style B** - Alternative visual treatment
- **Style C** - Minimalist approach

### Juice System

Arcade-style feedback effects that make the game feel impactful:

| Effect | Description |
|--------|-------------|
| **Camera Shake** | Damped impulse kick on block placement |
| **Hit-Stop** | Brief freeze frame on impact (fighting game style) |
| **Grid Pulse** | Visual flash feedback on the ground grid |
| **Grid Motion** | Subtle parallax movement following the action |

Perfect placements trigger stronger effects than slice placements.

### Theme Colors

Choose from multiple neon color themes:
- Cyan (default)
- Magenta
- Green
- Orange
- And more...

### Accessibility

- **Reduced Motion** - Disables camera shake, grid motion, and reduces pulse intensity
- Individual toggles for each juice effect
- Adjustable music and SFX volume

## Settings

Access settings via the gear icon or **Esc** key:

- **Visual Style** - Choose between visual variants
- **Theme Color** - Pick your neon color
- **Music Volume** - Background music level (0-100)
- **SFX Volume** - Sound effects level (0-100)
- **Reduced Motion** - Accessibility option
- **Camera Shake** - Toggle impact shake
- **Grid Pulse** - Toggle placement flash
- **Grid Motion** - Toggle parallax effect
- **Hit-Stop** - Toggle freeze frames

### Audio Notes

- Browsers require a **user gesture** before playing audio
- On mobile/macOS, click or tap once if you don't hear music right away

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:cov` | Run tests with coverage |
| `npm run lint` | Run ESLint |

## Architecture

```
src/
├── core/                 # Pure game logic (no React/Three deps)
│   ├── types.ts          # Game types & constants
│   ├── geometry.ts       # Block slicing & overlap
│   ├── physics.ts        # Oscillation & falling
│   ├── scoring.ts        # Points & combos
│   └── __tests__/        # Unit tests
│
├── state/
│   ├── gameStore.ts      # Zustand game state
│   ├── settingsStore.ts  # Persisted settings
│   ├── visualStore.ts    # Visual configuration
│   └── types.ts          # State types
│
├── game/
│   ├── juice/            # Arcade feedback system
│   │   ├── CameraShake.ts    # Damped impulse shake
│   │   ├── HitStop.ts        # Freeze frame controller
│   │   ├── GridPulse.ts      # Visual pulse effect
│   │   ├── GridMotionController.ts  # Parallax movement
│   │   └── JuiceConfig.ts    # Tuning constants
│   ├── vfx/              # Particle effects
│   └── Theme.ts          # Color theming
│
├── audio/                # Sound system
│   ├── AudioManager.ts   # SFX playback
│   └── MusicManager.ts   # Background music
│
├── rendering/            # React Three Fiber components
│   ├── Scene.tsx         # Main canvas & setup
│   ├── Block.tsx         # Block mesh with neon material
│   ├── BlockStack.tsx    # Placed blocks
│   ├── MovingBlock.tsx   # Current oscillating block
│   ├── FallingPiece.tsx  # Sliced-off pieces
│   ├── CameraRig.tsx     # Smooth camera follow + shake
│   ├── VFXController.tsx # Effect orchestration
│   ├── Effects.tsx       # Bloom post-processing
│   └── Ground.tsx        # Grid floor with pulse
│
├── ui/                   # React UI overlay
│   ├── HUD.tsx           # Score & game screens
│   ├── Settings.tsx      # Settings panel
│   └── ComboIndicator.tsx
│
└── hooks/
    ├── useGameLoop.ts    # Fixed timestep loop
    ├── useInput.ts       # Keyboard/touch handling
    └── useHitStop.ts     # HitStop state hook
```

## Design Decisions

### Deterministic Game Logic

All game logic uses a fixed 16ms timestep with an accumulator pattern:

```typescript
while (accumulator >= FIXED_TIMESTEP) {
  tick(FIXED_TIMESTEP);
  accumulator -= FIXED_TIMESTEP;
}
```

### Pure Core Module

The `core/` directory contains pure functions with zero dependencies on React or Three.js:

- Fast unit tests
- Potential server-side validation
- Deterministic replay capability

### Juice System

The arcade feedback system uses singleton controllers for global state:

- **CameraShake**: Damped sine wave impulse (`sin(ωt) * e^(-dt)`)
- **HitStop**: Time scale control (0 = frozen, 1 = normal)
- **GridPulse**: Additive brightness with exponential decay

All effects respect the `reducedMotion` accessibility setting.

### Geometry Reuse

All blocks share a single `BoxGeometry` instance, scaled per-block. This minimizes GPU memory and draw call overhead.

## Tech Stack

- **Vite** - Build tooling
- **React 18** - UI framework
- **React Three Fiber** - Declarative Three.js
- **Three.js** - 3D rendering
- **Zustand** - State management with persistence
- **Vitest** - Testing
- **TypeScript** - Strict mode enabled

## License

MIT
