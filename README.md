# Bodoge! (ボドゲ！)

site: https://hinohi.github.io/bodoge/

## Prerequisites

- [mise](https://mise.jdx.dev/) (to install the pinned Node.js runtime)
- pnpm 12 (selected by the `packageManager` field)
- Rust toolchain with the `wasm32-unknown-unknown` target:
  ```
  rustup target add wasm32-unknown-unknown
  ```
- `wasm-bindgen-cli`:
  ```
  cargo install wasm-bindgen-cli --version 0.2.130 --locked
  ```

## Build

### Develop

```
  mise install
  pnpm install
  pnpm dev
```

`pnpm dev` rebuilds the WASM packages (debug) via `scripts/build-wasm.sh` and
then starts Vite. To rebuild WASM only:

```
pnpm build:wasm        # release
pnpm build:wasm:dev    # debug
```

### Test

```
pnpm playwright:install
cargo test --all
pnpm test
```

`pnpm test` runs the Playwright end-to-end suite. Install its browser binaries
once with `pnpm playwright:install` before running it.

### Connect Four self-play

The default match gives the new search and the original MCTree 200 ms per move each.

```sh
cargo run --release -p connect-four --example self_play -- --pairs 16 --seed 1
```

Each pair starts from the same seeded four-ply opening, with the engines
swapping sides. Pass `--opening-plies 0` to start from an empty board. The
runner prints each game's moves (columns 1–7 from left to right), wins by
side, draws, and mean, p95, and maximum move times.

Fixed node counts make the new search's moves repeatable across runs.

```sh
cargo run --release -p connect-four --example self_play -- \
  --a search:50000nodes --b search:500000nodes --pairs 8 --seed 1
```

The browser's CPU settings use the same search with time budgets of 200 ms
and 1 second. The engine uses iterative-deepening alpha–beta search with
transposition caching and checks for immediate wins and forced defenses
before evaluating a position. It can prove wins, losses, and draws when the
search reaches far enough. Timed games can vary with CPU load.

### Release

```
pnpm build
pnpm deploy
```

`pnpm build` invokes `scripts/build-wasm.sh` (release) automatically before
running `tsc` and `vite build`.
