# Neon Stack

A Tron-inspired block stacking game with arcade-style juice effects. Built with React, Three.js, and TypeScript.
getDefaultProguardFile('proguard-android-optimize.txt')


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
- **Capacitor** - Native Android wrapper

---

## Android App

The game can be built as a native Android application using Capacitor.

### Prerequisites

- **Node.js** 18+ and npm
- **Android Studio** (latest stable)
- **Android SDK** (API 22+ for target, API 34+ recommended)
- **Java 17** (bundled with Android Studio or install separately)

### Quick Start

```bash
# First time setup
npm install
npm run build
npx cap add android   # Only needed once
npx cap sync android

# Open in Android Studio
npm run android:open
```

### Development Workflow

| Command | Description |
|---------|-------------|
| `npm run android:sync` | Build web + sync to Android |
| `npm run android:open` | Open Android Studio |
| `npm run android:run` | Build, sync, and run on connected device/emulator |

### Running on Emulator

1. Open Android Studio with `npm run android:open`
2. Wait for Gradle sync to complete
3. Select an emulator from the device dropdown (or create one via AVD Manager)
4. Click the green **Run** button (or press Shift+F10)

### Running on Physical Device

1. Enable **Developer Options** on your Android device
2. Enable **USB Debugging** in Developer Options
3. Connect device via USB and accept the debugging prompt
4. Run `npm run android:run` or use Android Studio

### Building Release APK/AAB

#### Debug APK (for testing)

```bash
# Build and sync first
npm run android:sync

# Then in Android Studio:
# Build → Build Bundle(s) / APK(s) → Build APK(s)

# Or via command line:
cd android
./gradlew assembleDebug
# APK location: android/app/build/outputs/apk/debug/app-debug.apk
```

#### Release AAB (for Google Play)

1. **Generate a signing key** (one-time):
   ```bash
   keytool -genkey -v -keystore neon-stack-release.keystore -alias neon-stack -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Configure signing** in `android/app/build.gradle`:
   ```gradle
   android {
       signingConfigs {
           release {
               storeFile file('path/to/neon-stack-release.keystore')
               storePassword 'your-store-password'
               keyAlias 'neon-stack'
               keyPassword 'your-key-password'
           }
       }
       buildTypes {
           release {
               signingConfig signingConfigs.release
               minifyEnabled true
               proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
           }
       }
   }
   ```

3. **Build the release AAB**:
   ```bash
   cd android
   ./gradlew bundleRelease
   # AAB location: android/app/build/outputs/bundle/release/app-release.aab
   ```

### App Configuration

The Android app is configured in `capacitor.config.ts`:

| Setting | Value |
|---------|-------|
| App ID | `com.murat.neonstack` |
| App Name | Neon Stack |
| Web Directory | `dist` |

To change the app ID (required for Play Store):
1. Update `appId` in `capacitor.config.ts`
2. Update package name in `android/app/build.gradle`
3. Rename package directories in `android/app/src/main/java/`

### Features

- **Fullscreen immersive mode** - No status bar or navigation bar during gameplay
- **Portrait orientation lock** - Consistent gameplay experience
- **Keep screen on** - Screen won't dim during gameplay
- **Hardware accelerated WebView** - Smooth 3D rendering
- **Audio support** - Music and SFX work after first user interaction

### Troubleshooting

**Gradle sync fails:**
- File → Invalidate Caches → Restart
- Delete `android/.gradle` and sync again

**App crashes on launch:**
- Check `adb logcat` for errors
- Ensure `dist/` folder exists (`npm run build`)
- Run `npx cap sync android` after any web changes

**Audio not playing:**
- Audio requires a user gesture (tap) to start on Android
- The game already handles this - tap to start triggers audio

**Black screen:**
- Check for JavaScript errors in Chrome DevTools (chrome://inspect)
- Ensure WebView hardware acceleration is enabled (it is by default)

**Touch not responding:**
- Check viewport meta tag in `index.html`
- Ensure no conflicting touch handlers

### Project Structure

```
android/
├── app/
│   ├── src/main/
│   │   ├── java/com/murat/neonstack/
│   │   │   └── MainActivity.java    # Fullscreen + immersive mode
│   │   ├── res/
│   │   │   ├── drawable/            # App icon background
│   │   │   ├── drawable-v24/        # App icon foreground
│   │   │   ├── mipmap-*/            # Launcher icons (all densities)
│   │   │   ├── values/              # Theme colors, strings
│   │   │   └── xml/                 # File provider config
│   │   ├── assets/public/           # Compiled web app (synced from dist/)
│   │   └── AndroidManifest.xml      # App permissions, orientation
│   └── build.gradle                 # App-level Gradle config
├── build.gradle                     # Project-level Gradle config
└── capacitor.config.json            # Capacitor runtime config
```

## License

MIT
