# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bodoge! (ボドゲ！) is a web-based board game application that implements Tic-Tac-Toe, Connect Four, and Mancala. The architecture uses:
- **Frontend**: React with TypeScript
- **Game Logic & AI**: Rust compiled to WebAssembly
- **Communication**: Web Workers with Comlink for non-blocking WASM execution

## Essential Commands

### Development Workflow

1. **Build WASM packages first** (required before running frontend):
   ```bash
   wasm-pack build tic-tac-toe
   wasm-pack build connect-four
   wasm-pack build mancala
   ```

2. **Start development server**:
   ```bash
   npm run start
   ```

### Testing

Run all Rust tests:
```bash
cargo test --all
```

Run WASM tests for a specific game:
```bash
wasm-pack test --node [game-name]
```

Run frontend tests:
```bash
npm run test
```

### Code Quality

Using cargo-make (recommended):
```bash
cargo make lint     # Runs format + clippy
cargo make format   # Format Rust code
cargo make clippy   # Run Rust linter
```

### Production Build & Deploy

1. Build WASM for release:
   ```bash
   wasm-pack build --release tic-tac-toe
   wasm-pack build --release connect-four
   wasm-pack build --release mancala
   ```

2. Build frontend:
   ```bash
   npm run build
   ```

3. Deploy to GitHub Pages:
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

- Always build WASM packages before running the frontend
- The project uses a Rust workspace with three member crates
- Web Workers prevent UI blocking during AI calculations
- Custom webpack configuration (`config-overrides.js`) handles WASM files
- Each WASM package is referenced as a local file dependency in `package.json`