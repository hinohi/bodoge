# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bodoge! (ボドゲ！) is a web-based board game application that implements Tic-Tac-Toe, Connect Four, and Mancala. The architecture uses:
- **Frontend**: React with TypeScript
- **Game Logic & AI**: Rust compiled to WebAssembly
- **Communication**: Web Workers with Comlink for non-blocking WASM execution

## Essential Commands

### Development Workflow

1. **Build WASM packages** (release build for all three crates):
   ```bash
   npm run build:wasm          # release
   npm run build:wasm:dev      # debug
   ```
   Under the hood this runs `scripts/build-wasm.sh`, which invokes
   `cargo build --target wasm32-unknown-unknown` and then `wasm-bindgen`
   to emit `<crate>/pkg/`. Requires `wasm-bindgen-cli` on PATH
   (`cargo install wasm-bindgen-cli`) and the `wasm32-unknown-unknown`
   target (`rustup target add wasm32-unknown-unknown`).

2. **Start development server** (builds WASM in debug first):
   ```bash
   npm run dev
   ```

### Testing

Run all Rust tests:
```bash
cargo test --all
```

Run frontend tests:
```bash
npm run test
```

### Code Quality

**Rust** - Using cargo-make (recommended):
```bash
cargo make lint     # Runs format + clippy
cargo make format   # Format Rust code
cargo make clippy   # Run Rust linter
```

**JavaScript/TypeScript** - Using Biome v2:
```bash
npm run lint        # Check for issues
npm run lint:fix    # Fix issues automatically
npm run format      # Format code
```

### Production Build & Deploy

1. Build frontend (runs `build:wasm` automatically):
   ```bash
   npm run build
   ```

2. Deploy to GitHub Pages:
   ```bash
   npm run deploy
   ```

## Architecture Patterns

### React-WASM Communication

The project uses a consistent pattern for React-WASM communication:

1. **Worker Files** (`src/[game-name]/worker.ts`): Each game has an identical worker that loads its WASM module
2. **useWorker Hook** (`src/workerHook.ts`): Manages worker lifecycle, loading states, and cancellation
3. **Comlink**: Provides transparent async communication between React and Web Workers

### Game Implementation Pattern

Each game follows this structure:
- **Rust Module** (`[game-name]/src/`):
  - `lib.rs`: WASM bindings and public API
  - `board.rs`: Game state and rules
  - AI implementation (varies by game)
- **React Component** (`src/[game-name]/`):
  - Uses `useReducer` for state management
  - Async winner calculation after moves
  - Player selection (Human vs AI)

### AI Implementations

- **Connect Four**: Monte Carlo Tree Search (MCTS) with configurable parameters
- **Tic-Tac-Toe**: Minimax with alpha-beta pruning
- **Mancala**: Delegates to external `mancala_rust` crate

### Board Representations

- **Connect Four**: BitBoard (two u64s) for efficient win detection
- **Tic-Tac-Toe**: Simple 9-element array
- **Mancala**: External crate representation

## Important Notes

- `npm run dev` / `npm run build` rebuild the WASM packages automatically via `scripts/build-wasm.sh`; no separate step needed.
- The project uses a Rust workspace with three member crates.
- Web Workers prevent UI blocking during AI calculations.
- Vite configuration (`vite.config.ts`) handles WASM files with vite-plugin-wasm.
- Each WASM package is referenced as a local file dependency in `package.json`.
- `mancala`'s transitive `getrandom` 0.3 dep needs `RUSTFLAGS='--cfg getrandom_backend="wasm_js"'`; the build script sets this automatically.
- `src/env.js` shims the `env` module imported by wasm-bindgen output (the `instant` crate requires `env.now`).
- Build tool: Vite (migrated from Create React App).
- WASM tooling: `wasm-bindgen-cli` directly (migrated from `wasm-pack`).
- Linter: Biome v2 (migrated from ESLint).
- Build output is in `dist/` instead of `build/`.