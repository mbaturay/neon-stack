# Neon Stack

A Tron-inspired block stacking game built with React, Three.js, and TypeScript.

***************************
** Murat Baturay (c)2026 **
***************************

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 (or use your LAN IP for mobile testing).

## How to Play

**Goal:** stack blocks as high as you can without missing.

1. **Start** the game with **Space / Enter / Click / Tap**.
2. Watch the moving block slide back and forth.
3. **Drop** at the right moment to land on the stack.
4. Any part that overhangs gets **sliced off** (making the next block smaller).
5. Keep landing blocks to build **combo multipliers** and increase your score.

### Scoring & Combos

- **Perfect hits** (very small offset) preserve the block size and build a streak.
- Streaks increase your **combo multiplier** (2x, 4x, 8x, ...).
- The game ends when a block **completely misses** the stack.

### Tips

- Focus on the **leading edge** of the moving block.
- Early in the run, prioritize **perfect hits** to keep the block large.
- If the block gets tiny, aim for **safe center landings** to stabilize.

### Settings / Audio Notes

- You can adjust **Music** and **SFX** volume in the in-game settings.
- Browsers require a **user gesture** before playing audio; on mobile/macOS, click/tap once if you don’t hear music right away.

## Controls

- **Space / Enter / Click / Tap** - Start game or drop block
- Blocks alternate between X and Z axis movement
- Land blocks precisely for combo multipliers

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
│   ├── gameStore.ts      # Zustand store
│   └── types.ts          # State types
│
├── rendering/            # React Three Fiber components
│   ├── Scene.tsx         # Main canvas & setup
│   ├── Block.tsx         # Block mesh with neon material
│   ├── BlockStack.tsx    # Placed blocks
│   ├── MovingBlock.tsx   # Current oscillating block
│   ├── FallingPiece.tsx  # Sliced-off pieces
│   ├── CameraRig.tsx     # Smooth camera follow
│   ├── Effects.tsx       # Bloom post-processing
│   └── Ground.tsx        # Grid floor
│
├── ui/                   # React UI overlay
│   ├── HUD.tsx           # Score & screens
│   └── ComboIndicator.tsx
│
└── hooks/
    ├── useGameLoop.ts    # Fixed timestep loop
    └── useInput.ts       # Keyboard/touch handling
```

## Design Decisions

### Deterministic Game Logic

All game logic uses a fixed 16ms timestep with an accumulator pattern. This ensures identical behavior regardless of frame rate:

```typescript
while (accumulator >= FIXED_TIMESTEP) {
  tick(FIXED_TIMESTEP);
  accumulator -= FIXED_TIMESTEP;
}
```

### Pure Core Module

The `core/` directory contains pure functions with zero dependencies on React or Three.js. This enables:

- Fast unit tests (53 tests run in <400ms)
- Potential server-side validation
- Deterministic replay

### Geometry Reuse

All blocks share a single `BoxGeometry` instance, scaled per-block. This minimizes GPU memory and draw call overhead.

## Tech Stack

- **Vite** - Build tooling
- **React 18** - UI framework
- **React Three Fiber** - Declarative Three.js
- **Zustand** - State management
- **Vitest** - Testing
- **TypeScript** - Strict mode enabled

## Game Mechanics

1. Blocks oscillate back and forth along alternating axes
2. Tap to drop the current block onto the stack
3. Overhanging portions are sliced off and fall away
4. **Perfect hits** (within 0.1 units) keep the full block size and build combo streaks
5. Combos multiply score: 2x, 4x, 8x, etc.
6. Game ends when a block completely misses the stack

## License

MIT

## About Me

I'm a winner, I'm a sinner, do you want my authograph?